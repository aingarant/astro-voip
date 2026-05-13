import type { Context } from 'hono'

export type TenantScope =
  | { accountId: number; domain: string }
  | { error: string }

export const getTenantScopeFromQuery = (c: Context): TenantScope => {
  const accountIdRaw = c.req.query('accountId')
  const domain = c.req.query('domain')

  if (!accountIdRaw) return { error: 'accountId query parameter is required' }
  if (!domain || !domain.trim()) return { error: 'domain query parameter is required' }

  const accountId = Number.parseInt(accountIdRaw, 10)
  if (Number.isNaN(accountId) || accountId <= 0) return { error: 'accountId query parameter must be a positive number' }

  return { accountId, domain }
}

