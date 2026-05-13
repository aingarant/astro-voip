import { Hono } from 'hono'
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { db } from '../db'
import { dialplan } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateRequiredString } from '../utils/validators'

const dialplanRoute = new Hono()

dialplanRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const dpidParam = c.req.query('dpid')
    const dpid = dpidParam ? Number.parseInt(dpidParam, 10) : undefined

    if (dpidParam && (Number.isNaN(dpid) || dpid === undefined)) {
      return badRequest(c, 'dpid must be a number')
    }

    const rows = dpid === undefined
      ? await db.select().from(dialplan).limit(limit).offset(offset)
      : await db.select().from(dialplan).where(eq(dialplan.dpid, dpid)).limit(limit).offset(offset)

    return c.json({ dialplan: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dialplanRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(dialplan).where(eq(dialplan.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Dialplan rule not found')
    return c.json({ dialplan: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dialplanRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { dpid, pr, matchOp, matchExp, matchLen, substExp, replExp, attrs } = body

  if ([dpid, pr, matchOp, matchLen].some((value) => typeof value !== 'number' || Number.isNaN(value))) {
    return badRequest(c, 'dpid, pr, matchOp and matchLen must be numbers')
  }
  for (const [field, value] of Object.entries({ matchExp, substExp, replExp, attrs })) {
    const validation = validateRequiredString(value, field)
    if (!validation.success) return badRequest(c, validation.error)
  }

  try {
    const created = await db.insert(dialplan).values({
      dpid,
      pr,
      matchOp,
      matchExp,
      matchLen,
      substExp,
      replExp,
      attrs,
    }).returning()
    return c.json({ dialplan: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dialplanRoute.put('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = await c.req.json()
  const { dpid, pr, matchOp, matchExp, matchLen, substExp, replExp, attrs } = body
  if ([dpid, pr, matchOp, matchLen].some((value) => typeof value !== 'number' || Number.isNaN(value))) {
    return badRequest(c, 'dpid, pr, matchOp and matchLen must be numbers')
  }
  for (const [field, value] of Object.entries({ matchExp, substExp, replExp, attrs })) {
    const validation = validateRequiredString(value, field)
    if (!validation.success) return badRequest(c, validation.error)
  }

  try {
    const updated = await db.update(dialplan).set({
      dpid,
      pr,
      matchOp,
      matchExp,
      matchLen,
      substExp,
      replExp,
      attrs,
    }).where(eq(dialplan.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Dialplan rule not found')
    return c.json({ dialplan: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dialplanRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(dialplan).where(eq(dialplan.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Dialplan rule not found')
    return c.json({ dialplan: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default dialplanRoute

export type DialplanRule = InferSelectModel<typeof dialplan>
export type NewDialplanRule = InferInsertModel<typeof dialplan>
