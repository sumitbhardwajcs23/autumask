import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Production-Grade Encryption-at-Rest Utility (AES-256-GCM)
 * Encrypts tenant WhatsApp credentials and sensitive provider tokens.
 */
export class CryptoUtils {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96 bits for GCM

  /**
   * Derive a 32-byte key from JWT_SECRET or master encryption key
   */
  private static getMasterKey(): Buffer {
    const secret = env.JWT_SECRET || 'automask-default-encryption-key-32-chars';
    return crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * Encrypt plaintext string using AES-256-GCM
   * Returns format: iv_hex:auth_tag_hex:ciphertext_hex
   */
  public static encrypt(plaintext: string): string {
    if (!plaintext) return '';
    const key = this.getMasterKey();
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt AES-256-GCM ciphertext
   * Returns original plaintext or falls back safely if unencrypted
   */
  public static decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    const parts = encryptedText.split(':');

    // Not in iv:tag:ciphertext format (e.g., legacy or mock plaintext)
    if (parts.length !== 3) {
      return encryptedText;
    }

    try {
      const [ivHex, tagHex, cipherHex] = parts;
      const key = this.getMasterKey();
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      // In case of tampering or key mismatch, fail safely
      return encryptedText;
    }
  }
}
