export type PaginationParams = {
  limit?: number;
  offset?: number;
};

export type TenantScope = {
  accountId: number;
  domain: string;
};

export type ApiErrorBody = {
  error?: string;
  status?: string;
  [key: string]: unknown;
};

export type PageMeta = {
  limit: number;
  offset: number;
};

export type ListResponse<T, K extends string> = Record<K, T[]> & {
  page?: PageMeta;
};
