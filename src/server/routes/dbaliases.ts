import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { dbaliases } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateRequiredString } from '../utils/validators'

const dbaliasesRoute = new Hono()

dbaliasesRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(dbaliases).limit(limit).offset(offset)
    return c.json({ dbaliases: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dbaliasesRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const rows = await db.select().from(dbaliases).where(eq(dbaliases.id, parsed.id)).limit(1)
    if (!rows[0]) return notFound(c, 'DB alias not found')
    return c.json({ dbalias: rows[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dbaliasesRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { aliasUsername, aliasDomain, username, domain } = body
  for (const [field, value] of Object.entries({ aliasUsername, aliasDomain, username, domain })) {
    const validation = validateRequiredString(value, field)
    if (!validation.success) return badRequest(c, validation.error)
  }

  try {
    const created = await db.insert(dbaliases).values({
      aliasUsername,
      aliasDomain,
      username,
      domain,
    }).returning()
    return c.json({ dbalias: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dbaliasesRoute.put('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { aliasUsername, aliasDomain, username, domain } = body
  for (const [field, value] of Object.entries({ aliasUsername, aliasDomain, username, domain })) {
    const validation = validateRequiredString(value, field)
    if (!validation.success) return badRequest(c, validation.error)
  }

  try {
    const updated = await db.update(dbaliases).set({
      aliasUsername,
      aliasDomain,
      username,
      domain,
    }).where(eq(dbaliases.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'DB alias not found')
    return c.json({ dbalias: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dbaliasesRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(dbaliases).where(eq(dbaliases.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'DB alias not found')
    return c.json({ dbalias: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default dbaliasesRoute
