import type { ApiErrorBody } from './types';

const DEFAULT_API_BASE = 'http://127.0.0.1:8787';

type QueryParams = Record<string, string | number | boolean | null | undefined>;

export class HttpApiError extends Error {
  status: number;
  payload: ApiErrorBody | null;

  constructor(message: string, status: number, payload: ApiErrorBody | null = null) {
    super(message);
    this.name = 'HttpApiError';
    this.status = status;
    this.payload = payload;
  }
}

const getApiBaseUrl = (): string => {
  const envBase =
    import.meta.env.PUBLIC_API_BASE_URL ||
    import.meta.env.PUBLIC_BACKEND_URL ||
    import.meta.env.PUBLIC_API_URL;
  return envBase ?? DEFAULT_API_BASE;
};

const buildUrl = (path: string, query?: QueryParams): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(normalizedPath, getApiBaseUrl());
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
};

const parseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
  query?: QueryParams,
): Promise<T> => {
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await parseBody(response)) as ApiErrorBody | null;

  if (!response.ok) {
    const message = payload?.error || payload?.status || `Request failed with status ${response.status}`;
    throw new HttpApiError(message, response.status, payload);
  }

  return payload as T;
};

export const getJson = <T>(path: string, query?: QueryParams) => apiRequest<T>(path, undefined, query);

export const postJson = <T>(path: string, body: unknown, query?: QueryParams) =>
  apiRequest<T>(
    path,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    query,
  );

export const putJson = <T>(path: string, body: unknown, query?: QueryParams) =>
  apiRequest<T>(
    path,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
    query,
  );

export const patchJson = <T>(path: string, body: unknown, query?: QueryParams) =>
  apiRequest<T>(
    path,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    query,
  );

export const deleteJson = <T>(path: string, query?: QueryParams) =>
  apiRequest<T>(
    path,
    {
      method: 'DELETE',
    },
    query,
  );
