import { Hono } from 'hono'
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { db } from '../db'
import { dispatcher } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateRequiredString } from '../utils/validators'

const dispatcherRoute = new Hono()

dispatcherRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(dispatcher).limit(limit).offset(offset)
    return c.json({ dispatcher: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dispatcherRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(dispatcher).where(eq(dispatcher.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Dispatcher record not found')
    return c.json({ dispatcher: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dispatcherRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { setid, destination, flags = 0, priority = 0, attrs = '', description = '' } = body
  if (typeof setid !== 'number' || Number.isNaN(setid)) return badRequest(c, 'setid must be a number')
  const destinationValidation = validateRequiredString(destination, 'destination')
  if (!destinationValidation.success) return badRequest(c, destinationValidation.error)

  try {
    const created = await db.insert(dispatcher).values({ setid, destination, flags, priority, attrs, description }).returning()
    return c.json({ dispatcher: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dispatcherRoute.put('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { setid, destination, flags, priority, attrs, description } = body
  if (typeof setid !== 'number' || Number.isNaN(setid)) return badRequest(c, 'setid must be a number')
  const destinationValidation = validateRequiredString(destination, 'destination')
  if (!destinationValidation.success) return badRequest(c, destinationValidation.error)

  try {
    const updated = await db.update(dispatcher).set({
      setid,
      destination,
      flags: typeof flags === 'number' ? flags : 0,
      priority: typeof priority === 'number' ? priority : 0,
      attrs: typeof attrs === 'string' ? attrs : '',
      description: typeof description === 'string' ? description : '',
    }).where(eq(dispatcher.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Dispatcher record not found')
    return c.json({ dispatcher: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dispatcherRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(dispatcher).where(eq(dispatcher.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Dispatcher record not found')
    return c.json({ dispatcher: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default dispatcherRoute

export type Dispatcher = InferSelectModel<typeof dispatcher>
export type NewDispatcher = InferInsertModel<typeof dispatcher>
