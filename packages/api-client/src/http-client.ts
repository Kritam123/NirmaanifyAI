import { ApiResponse, ApiErrorResponse } from '@nirmaanify/types';

declare const process: any;

export interface HttpClientConfig {
  baseUrl?: string;
  getToken?: () => string | null | undefined;
  setToken?: (token: string | null) => void;
  onError?: (error: ErrorResponse) => void;
}

export class ErrorResponse extends Error {
  public statusCode: number;
  public errors?: any[];
  public path?: string;

  constructor(message: string, statusCode = 500, errors?: any[], path?: string) {
    super(message);
    this.name = 'ErrorResponse';
    this.statusCode = statusCode;
    this.errors = errors;
    this.path = path;
  }
}

export class HttpClient {
  private baseUrl: string;
  private getToken?: () => string | null | undefined;
  private token: string | null = null;
  private onError?: (error: ErrorResponse) => void;

  constructor(config: HttpClientConfig = {}) {
    const envUrl = typeof process !== 'undefined' && process?.env ? process.env.NEXT_PUBLIC_API_URL : undefined;
    this.baseUrl = (config.baseUrl || envUrl || 'http://localhost:4000').replace(/\/$/, '');
    this.getToken = config.getToken;
    this.onError = config.onError;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setToken(token: string | null): void {
    this.token = token;
  }

  public getAuthToken(): string | null {
    if (this.getToken) {
      const dynamicToken = this.getToken();
      if (dynamicToken !== undefined) return dynamicToken;
    }
    return this.token;
  }

  private getHeaders(customHeaders?: HeadersInit, isMultipart = false): Headers {
    const headers = new Headers(customHeaders);
    if (!isMultipart && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    const token = this.getAuthToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  public resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    let cleanBase = this.baseUrl.replace(/\/+$/, '');
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Avoid duplicate /api/v1 prefix if both base and endpoint have it
    if (cleanBase.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1/')) {
      cleanEndpoint = cleanEndpoint.substring('/api/v1'.length);
    } else if (cleanBase && !cleanBase.endsWith('/api/v1') && !cleanEndpoint.startsWith('/api/v1/')) {
      cleanEndpoint = `/api/v1${cleanEndpoint}`;
    }

    return `${cleanBase}${cleanEndpoint}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isMultipart = false
  ): Promise<T> {
    const url = this.resolveUrl(endpoint);

    const headers = this.getHeaders(options.headers, isMultipart);
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const res = await fetch(url, config);

      const contentType = res.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!res.ok) {
        const message =
          (data && typeof data === 'object' && (data.message || data.error)) ||
          `Request failed with status ${res.status}`;
        const errorObj = new ErrorResponse(
          Array.isArray(message) ? message.join(', ') : String(message),
          res.status,
          data?.errors,
          endpoint
        );
        this.onError?.(errorObj);
        throw errorObj;
      }

      // Check if wrapped in ApiResponse envelope
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        return (data as ApiResponse<T>).data;
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ErrorResponse) {
        throw err;
      }
      const networkError = new ErrorResponse(
        err?.message || 'Network connection failed',
        0,
        undefined,
        endpoint
      );
      this.onError?.(networkError);
      throw networkError;
    }
  }

  public async get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public async post<T>(endpoint: string, body?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async postFormData<T>(endpoint: string, formData: FormData, headers?: HeadersInit): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: formData,
        headers,
      },
      true
    );
  }

  public async put<T>(endpoint: string, body?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async patch<T>(endpoint: string, body?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}
