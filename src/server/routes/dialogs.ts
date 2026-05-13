import { Hono } from 'hono'
import { and, eq, type InferSelectModel } from 'drizzle-orm'
import { db } from '../db'
import { dialog, dialogVars } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'

const dialogsRoute = new Hono()

dialogsRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(dialog).limit(limit).offset(offset)
    return c.json({ dialogs: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dialogsRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(dialog).where(eq(dialog.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Dialog not found')
    return c.json({ dialog: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

dialogsRoute.get('/:id/vars', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(dialog).where(eq(dialog.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Dialog not found')

    const vars = await db
      .select()
      .from(dialogVars)
      .where(and(eq(dialogVars.hashEntry, row[0].hashEntry), eq(dialogVars.hashId, row[0].hashId)))

    return c.json({ dialogId: row[0].id, vars })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default dialogsRoute

export type Dialog = InferSelectModel<typeof dialog>
