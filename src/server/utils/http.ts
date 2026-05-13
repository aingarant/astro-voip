import type { Context } from 'hono'

export const badRequest = (c: Context, error: string | undefined) => c.json({ error: error ?? 'Bad request' }, 400)
export const notFound = (c: Context, error: string | undefined) => c.json({ error: error ?? 'Not found' }, 404)
export const conflict = (c: Context, error: string | undefined) => c.json({ error: error ?? 'Conflict' }, 409)
export const internalError = (c: Context, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return c.json({ error: message }, 500)
}

export const parseIdParam = (rawId: string | undefined) => {
  if (!rawId) {
    return { error: 'ID must be a positive number' as const }
  }
  const id = Number.parseInt(rawId, 10)
  if (Number.isNaN(id) || id <= 0) {
    return { error: 'ID must be a positive number' as const }
  }
  return { id }
}

export const parseNumberQuery = (value: string | undefined, fallback: number) => {
  if (value === undefined) return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return fallback
  return parsed
}

export const normalizePagination = (limitParam?: string, offsetParam?: string) => {
  const limit = Math.min(Math.max(parseNumberQuery(limitParam, 50), 1), 500)
  const offset = Math.max(parseNumberQuery(offsetParam, 0), 0)
  return { limit, offset }
}
