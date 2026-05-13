import { Hono } from 'hono'
import { and, eq, gt, sql, type InferSelectModel, type SQL } from 'drizzle-orm'
import { db } from '../db'
import { location } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'

const registrationsRoute = new Hono()

const buildRegistrationFilters = (username?: string, domain?: string, activeOnly?: boolean) => {
  const filters: SQL[] = []
  if (username) filters.push(eq(location.username, username))
  if (domain) filters.push(eq(location.domain, domain))
  if (activeOnly) filters.push(gt(location.expires, sql`CURRENT_TIMESTAMP`))
  return filters
}

registrationsRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const username = c.req.query('username')
    const domain = c.req.query('domain')
    const activeOnly = c.req.query('activeOnly') === '1'

    const filters = buildRegistrationFilters(username, domain, activeOnly)

    const rows = filters.length > 0
      ? await db.select().from(location).where(and(...filters)).limit(limit).offset(offset)
      : await db.select().from(location).limit(limit).offset(offset)

    return c.json({ registrations: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

registrationsRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(location).where(eq(location.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Registration not found')
    return c.json({ registration: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default registrationsRoute

export type Registration = InferSelectModel<typeof location>
