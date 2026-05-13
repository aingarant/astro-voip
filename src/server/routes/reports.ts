import { Hono } from 'hono'
import { and, count, eq, gte, lte, sql, type SQL } from 'drizzle-orm'
import { db } from '../db'
import { acc, accCdrs, missedCalls } from '../db/schema'
import { badRequest, internalError, normalizePagination } from '../utils/http'

const reportsRoute = new Hono()

reportsRoute.get('/cdrs', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const startTime = c.req.query('startTime')
    const endTime = c.req.query('endTime')
    const minDurationParam = c.req.query('minDuration')
    const maxDurationParam = c.req.query('maxDuration')

    const minDuration = minDurationParam ? Number.parseFloat(minDurationParam) : undefined
    const maxDuration = maxDurationParam ? Number.parseFloat(maxDurationParam) : undefined

    if (minDurationParam && Number.isNaN(minDuration)) return badRequest(c, 'minDuration must be a number')
    if (maxDurationParam && Number.isNaN(maxDuration)) return badRequest(c, 'maxDuration must be a number')

    const filters: SQL[] = []
    if (startTime) filters.push(gte(accCdrs.startTime, startTime))
    if (endTime) filters.push(lte(accCdrs.startTime, endTime))
    if (minDuration !== undefined) filters.push(gte(accCdrs.duration, minDuration))
    if (maxDuration !== undefined) filters.push(lte(accCdrs.duration, maxDuration))

    const rows = filters.length > 0
      ? await db.select().from(accCdrs).where(and(...filters)).limit(limit).offset(offset)
      : await db.select().from(accCdrs).limit(limit).offset(offset)

    const aggregateRows = filters.length > 0
      ? await db
          .select({
            totalCalls: count(accCdrs.id),
            averageDuration: sql<number>`COALESCE(AVG(${accCdrs.duration}), 0)`,
          })
          .from(accCdrs)
          .where(and(...filters))
      : await db
          .select({
            totalCalls: count(accCdrs.id),
            averageDuration: sql<number>`COALESCE(AVG(${accCdrs.duration}), 0)`,
          })
          .from(accCdrs)

    return c.json({
      cdrs: rows,
      summary: aggregateRows[0] ?? { totalCalls: 0, averageDuration: 0 },
      page: { limit, offset },
    })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

reportsRoute.get('/acc', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const method = c.req.query('method')
    const sipCode = c.req.query('sipCode')

    const filters: SQL[] = []
    if (method) filters.push(eq(acc.method, method))
    if (sipCode) filters.push(eq(acc.sipCode, sipCode))

    const rows = filters.length > 0
      ? await db.select().from(acc).where(and(...filters)).limit(limit).offset(offset)
      : await db.select().from(acc).limit(limit).offset(offset)

    const totals = filters.length > 0
      ? await db.select({ total: count(acc.id) }).from(acc).where(and(...filters))
      : await db.select({ total: count(acc.id) }).from(acc)

    return c.json({ acc: rows, summary: totals[0] ?? { total: 0 }, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

reportsRoute.get('/missed-calls', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const sipCode = c.req.query('sipCode')

    const rows = sipCode
      ? await db.select().from(missedCalls).where(eq(missedCalls.sipCode, sipCode)).limit(limit).offset(offset)
      : await db.select().from(missedCalls).limit(limit).offset(offset)

    const totals = sipCode
      ? await db.select({ total: count(missedCalls.id) }).from(missedCalls).where(eq(missedCalls.sipCode, sipCode))
      : await db.select({ total: count(missedCalls.id) }).from(missedCalls)

    return c.json({ missedCalls: rows, summary: totals[0] ?? { total: 0 }, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default reportsRoute
