import { Hono } from 'hono'
import { and, eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { db } from '../db'
import { dids, subscriber } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateFlag01, validateRequiredString } from '../utils/validators'

const didsRoute = new Hono()

didsRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const accountIdParam = c.req.query('accountId')
    const domainParam = c.req.query('domain')

    if (accountIdParam) {
      const accountId = Number.parseInt(accountIdParam, 10)
      if (Number.isNaN(accountId) || accountId <= 0) return badRequest(c, 'accountId must be a positive number')

      const accountDids = domainParam
        ? await db
            .select()
            .from(dids)
            .where(and(eq(dids.accountId, accountId), eq(dids.domain, domainParam)))
            .limit(limit)
            .offset(offset)
        : await db
            .select()
            .from(dids)
            .where(eq(dids.accountId, accountId))
            .limit(limit)
            .offset(offset)

      return c.json({ dids: accountDids, page: { limit, offset } })
    }

    const rows = await db.select().from(dids).limit(limit).offset(offset)
    return c.json({ dids: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

didsRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(dids).where(eq(dids.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'DID not found')
    return c.json({ did: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

didsRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { did, accountId, domain, isActive = 1 } = body

  const didValidation = validateRequiredString(did, 'DID')
  if (!didValidation.success) return badRequest(c, didValidation.error)
  if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  const isActiveValidation = validateFlag01(isActive, 'Is Active')
  if (!isActiveValidation.success) return badRequest(c, isActiveValidation.error)

  try {
    const created = await db.insert(dids).values({ did, accountId, domain, isActive }).returning()
    return c.json({ did: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

didsRoute.put('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = await c.req.json()
  const { did, accountId, domain, isActive } = body

  const didValidation = validateRequiredString(did, 'DID')
  if (!didValidation.success) return badRequest(c, didValidation.error)
  if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  if (isActive === undefined) return badRequest(c, 'Is Active is required')
  const isActiveValidation = validateFlag01(isActive, 'Is Active')
  if (!isActiveValidation.success) return badRequest(c, isActiveValidation.error)

  try {
    const updated = await db.update(dids).set({ did, accountId, domain, isActive }).where(eq(dids.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'DID not found')
    return c.json({ did: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

didsRoute.patch('/:id/status', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { isActive } = body
  if (isActive === undefined) return badRequest(c, 'Is Active is required')
  const isActiveValidation = validateFlag01(isActive, 'Is Active')
  if (!isActiveValidation.success) return badRequest(c, isActiveValidation.error)

  try {
    const updated = await db.update(dids).set({ isActive }).where(eq(dids.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'DID not found')
    return c.json({ did: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

didsRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const linkedSubscriber = await db.select().from(subscriber).where(eq(subscriber.defaultDid, String(parsed.id))).limit(1)
    if (linkedSubscriber[0]) {
      return badRequest(c, 'DID is currently in use as a subscriber default DID')
    }

    const deleted = await db.delete(dids).where(eq(dids.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'DID not found')
    return c.json({ did: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default didsRoute

export type Did = InferSelectModel<typeof dids>
export type NewDid = InferInsertModel<typeof dids>
