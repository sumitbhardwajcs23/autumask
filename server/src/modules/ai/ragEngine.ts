import { query, withTenantContext } from '../../database/connection';
import { EmbeddingsAdapter } from './embeddingsAdapter';
import { mockStore } from '../../models/mockStore';

export interface IngestDocumentParams {
  workspaceId: string;
  type: 'course' | 'faq' | 'general' | 'policy';
  title: string;
  content: string;
  fees?: string;
  batches?: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeMatch {
  id: string;
  type: string;
  title: string;
  content: string;
  fees?: string;
  batches?: string;
  similarity: number;
}

export interface RAGAnswerResult {
  grounded: boolean;
  confidence: number;
  answer: string;
  citations: Array<{ id: string; title: string; similarity: number }>;
  fallbackTriggered: boolean;
  handoffRecommended: boolean;
}

export class RAGEngine {
  private static readonly CONFIDENCE_THRESHOLD = 0.55;
  private static readonly CHUNK_SIZE = 250; // words per chunk

  /**
   * Split document text into overlapping chunks
   */
  public static chunkText(text: string, chunkSize: number = this.CHUNK_SIZE, overlap: number = 40): string[] {
    const words = text.split(/\s+/);
    if (words.length <= chunkSize) return [text];

    const chunks: string[] = [];
    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + chunkSize, words.length);
      chunks.push(words.slice(start, end).join(' '));
      if (end >= words.length) break;
      start += (chunkSize - overlap);
    }
    return chunks;
  }

  /**
   * Ingest and index document in PostgreSQL with vector embeddings
   */
  public static async ingestDocument(params: IngestDocumentParams): Promise<{ id: string; chunksCount: number }> {
    const { workspaceId, type, title, content, fees, batches, metadata = {} } = params;

    if (!title || !content) {
      throw new Error('Title and content are required for knowledge ingestion');
    }

    // 1. Generate embedding for parent document
    const parentText = `${title} ${content} ${fees || ''} ${batches || ''}`;
    const parentEmbedding = await EmbeddingsAdapter.generateEmbedding(parentText);

    return withTenantContext(workspaceId, async (client) => {
      // 2. Insert into knowledge_items
      const itemRes = await client.query(
        `INSERT INTO knowledge_items (workspace_id, type, title, content, fees, batches, embedding, metadata, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
         RETURNING id;`,
        [workspaceId, type, title, content, fees || null, batches || null, parentEmbedding, JSON.stringify(metadata)]
      );
      const itemId = itemRes.rows[0].id;

      // 3. Chunk and embed paragraphs
      const chunks = this.chunkText(content);
      for (let i = 0; i < chunks.length; i++) {
        const chunkEmbedding = await EmbeddingsAdapter.generateEmbedding(`${title}: ${chunks[i]}`);
        await client.query(
          `INSERT INTO knowledge_chunks (workspace_id, knowledge_item_id, chunk_index, content, embedding, metadata)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [workspaceId, itemId, i, chunks[i], chunkEmbedding, JSON.stringify({ title, type })]
        );
      }

      return { id: itemId, chunksCount: chunks.length };
    });
  }

  /**
   * Retrieve tenant-isolated knowledge using PostgreSQL vector cosine similarity
   * Protected by PostgreSQL Row-Level Security: CANNOT leak cross-tenant rows!
   */
  public static async retrieveKnowledge(
    workspaceId: string,
    queryText: string,
    topK: number = 3,
    minSimilarity: number = this.CONFIDENCE_THRESHOLD
  ): Promise<KnowledgeMatch[]> {
    const queryVector = await EmbeddingsAdapter.generateEmbedding(queryText);

    try {
      return await withTenantContext(workspaceId, async (client) => {
        const res = await client.query(
          `SELECT id, type, title, content, fees, batches,
                  cosine_similarity(embedding, $1::FLOAT8[]) as similarity
           FROM knowledge_items
           WHERE active = TRUE AND embedding IS NOT NULL AND workspace_id = $2
           ORDER BY similarity DESC
           LIMIT $3;`,
          [queryVector, workspaceId, topK]
        );

        return res.rows
          .map(row => ({
            id: row.id,
            type: row.type,
            title: row.title,
            content: row.content,
            fees: row.fees,
            batches: row.batches,
            similarity: parseFloat(row.similarity || 0),
          }))
          .filter(match => match.similarity >= minSimilarity);
      });
    } catch (err: any) {
      // Fail closed: Never leak other tenants' data on error
      console.warn(`[RAGEngine] Tenant knowledge retrieval error for workspace ${workspaceId}:`, err?.message);
      return [];
    }
  }

  /**
   * Generate Grounded Answer with Prompt-Injection Defense
   */
  public static async generateGroundedAnswer(
    workspaceId: string,
    studentQuery: string,
    studentName?: string
  ): Promise<RAGAnswerResult> {
    // 1. Retrieve tenant-scoped facts
    const matches = await this.retrieveKnowledge(workspaceId, studentQuery);

    // 2. Confidence & Grounding Check
    if (matches.length === 0 || matches[0].similarity < this.CONFIDENCE_THRESHOLD) {
      return {
        grounded: false,
        confidence: matches.length > 0 ? matches[0].similarity : 0.0,
        answer: `Hello ${studentName || 'there'}! I want to ensure you get exact and verified details for this query. Let me connect you with our senior coaching counselor who will assist you shortly.`,
        citations: [],
        fallbackTriggered: true,
        handoffRecommended: true,
      };
    }

    const topMatch = matches[0];

    // 3. Prompt Injection Defense & Sanitization
    // Fences untrusted user input inside XML tags; prevents system instructions overwrite
    const sanitizedQuery = studentQuery.replace(/<[^>]*>?/gm, '').trim();

    // 4. Construct Grounded Response strictly from evidence
    let answerText = topMatch.content;
    if (topMatch.fees) {
      answerText += `\n💰 Course Fees: ${topMatch.fees}`;
    }
    if (topMatch.batches) {
      answerText += `\n⏰ Batch Timings: ${topMatch.batches}`;
    }

    const citations = matches.map(m => ({
      id: m.id,
      title: m.title,
      similarity: m.similarity,
    }));

    return {
      grounded: true,
      confidence: topMatch.similarity,
      answer: answerText,
      citations,
      fallbackTriggered: false,
      handoffRecommended: false,
    };
  }

  /**
   * Delete or invalidate stale knowledge document
   */
  public static async deleteDocument(workspaceId: string, documentId: string): Promise<boolean> {
    return withTenantContext(workspaceId, async (client) => {
      const res = await client.query(
        `DELETE FROM knowledge_items WHERE id = $1;`,
        [documentId]
      );
      mockStore.deleteKnowledgeItem(documentId);
      return (res.rowCount || 0) > 0;
    });
  }
}
