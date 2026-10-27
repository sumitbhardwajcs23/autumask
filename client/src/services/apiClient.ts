/**
 * AutoMask Centralized REST API Client
 * 
 * Provides:
 * - Environment-driven base URL (VITE_API_BASE_URL)
 * - Request timeouts with AbortController
 * - Unified error handling (ApiError)
 * - Session cookies & JWT authorization support
 * - Dynamic development role/workspace context headers
 * - Strict error surfacing (NO silent mock fallback in production)
 */

export interface ApiClientConfig {
  baseUrl?: string;
  defaultTimeoutMs?: number;
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: any;
  public isTimeout: boolean;
  public isNetworkError: boolean;

  constructor(message: string, status = 0, statusText = '', data?: any, isTimeout = false, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.isTimeout = isTimeout;
    this.isNetworkError = isNetworkError;
  }
}

// Active authentication & tenant context for API requests
let activeUserRole: string = 'admin';
let activeUserId: string = 'usr-sumit-01';
let activeWorkspaceId: string = '11111111-1111-4111-8111-111111111111';
let authToken: string | null = null;

export const setApiAuthContext = (context: {
  role?: string;
  userId?: string;
  workspaceId?: string;
  token?: string | null;
}) => {
  if (context.role) activeUserRole = context.role;
  if (context.userId) activeUserId = context.userId;
  if (context.workspaceId) activeWorkspaceId = context.workspaceId;
  if (context.token !== undefined) {
    authToken = context.token;
    if (context.token) {
      localStorage.setItem('automask_token', context.token);
    } else {
      localStorage.removeItem('automask_token');
    }
  }
};

export const getApiAuthContext = () => ({
  role: activeUserRole,
  userId: activeUserId,
  workspaceId: activeWorkspaceId,
  token: authToken || localStorage.getItem('automask_token'),
});

class ApiClient {
  private baseUrl: string;
  private defaultTimeoutMs: number;

  constructor(config: ApiClientConfig = {}) {
    const envBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
    this.baseUrl = (config.baseUrl || envBase || '/api/v1').replace(/\/+$/, '');
    this.defaultTimeoutMs = config.defaultTimeoutMs || 12000;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs = this.defaultTimeoutMs, params, ...fetchOptions } = options;

    let url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    const headers = new Headers(fetchOptions.headers || {});
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Include development role & user context headers for server-side RBAC
    const ctx = getApiAuthContext();
    if (ctx.role) headers.set('x-user-role', ctx.role);
    if (ctx.userId) headers.set('x-user-id', ctx.userId);
    if (ctx.workspaceId) headers.set('x-workspace-id', ctx.workspaceId);
    if (ctx.token) headers.set('Authorization', `Bearer ${ctx.token}`);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
        credentials: 'include', // Support HttpOnly cookies
      });

      clearTimeout(timeoutTimer);

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else {
        data = await response.text().catch(() => null);
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `HTTP ${response.status} ${response.statusText}`;
        throw new ApiError(errorMsg, response.status, response.statusText, data);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeoutTimer);

      if (err instanceof ApiError) {
        throw err;
      }

      if (err?.name === 'AbortError') {
        throw new ApiError(`Request timeout after ${timeoutMs}ms: ${url}`, 408, 'Request Timeout', null, true);
      }

      throw new ApiError(err?.message || 'Network error occurred', 0, 'Network Error', null, false, true);
    }
  }

  public get<T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public patch<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public put<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public delete<T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
