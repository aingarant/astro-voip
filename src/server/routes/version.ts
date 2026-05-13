import { Hono } from 'hono'
import { db } from '../db'
import { version } from '../db/schema'
import { internalError, normalizePagination } from '../utils/http'

const versionRoute = new Hono()

versionRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(version).limit(limit).offset(offset)
    return c.json({ version: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default versionRoute
