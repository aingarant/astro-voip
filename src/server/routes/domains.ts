import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { domain, domainAttrs } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateRequiredString } from '../utils/validators'

const domainsRoute = new Hono()

domainsRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(domain).limit(limit).offset(offset)
    return c.json({ domains: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

domainsRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const rows = await db.select().from(domain).where(eq(domain.id, parsed.id)).limit(1)
    if (!rows[0]) return notFound(c, 'Domain not found')
    return c.json({ domain: rows[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

domainsRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { domain: domainName, did } = body
  const domainValidation = validateRequiredString(domainName, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  if (did !== undefined && did !== null && typeof did !== 'string') return badRequest(c, 'DID must be a string')

  try {
    const created = await db.insert(domain).values({
      domain: domainName,
      did: typeof did === 'string' ? did : null,
    }).returning()
    return c.json({ domain: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

domainsRoute.put('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { domain: domainName, did } = body
  const domainValidation = validateRequiredString(domainName, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  if (did !== undefined && did !== null && typeof did !== 'string') return badRequest(c, 'DID must be a string')

  try {
    const updated = await db.update(domain).set({
      domain: domainName,
      did: typeof did === 'string' ? did : null,
    }).where(eq(domain.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Domain not found')
    return c.json({ domain: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

domainsRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(domain).where(eq(domain.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Domain not found')

    await db.delete(domainAttrs).where(eq(domainAttrs.did, row[0].domain))
    const deleted = await db.delete(domain).where(eq(domain.id, parsed.id)).returning()
    return c.json({ domain: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

domainsRoute.get('/:id/attrs', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(domain).where(eq(domain.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Domain not found')
    const attrs = await db.select().from(domainAttrs).where(eq(domainAttrs.did, row[0].domain))
    return c.json({ domain: row[0], attrs })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

domainsRoute.post('/:id/attrs', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { name, type, value } = body
  const nameValidation = validateRequiredString(name, 'Name')
  if (!nameValidation.success) return badRequest(c, nameValidation.error)
  if (typeof type !== 'number' || Number.isNaN(type)) return badRequest(c, 'Type must be a number')
  const valueValidation = validateRequiredString(value, 'Value')
  if (!valueValidation.success) return badRequest(c, valueValidation.error)

  try {
    const row = await db.select().from(domain).where(eq(domain.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Domain not found')
    const created = await db.insert(domainAttrs).values({
      did: row[0].domain,
      name,
      type,
      value,
    }).returning()
    return c.json({ attr: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

domainsRoute.put('/:id/attrs/:attrId', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const attrParsed = parseIdParam(c.req.param('attrId'))
  if ('error' in attrParsed) return badRequest(c, attrParsed.error)

  const body = await c.req.json()
  const { name, type, value } = body
  const nameValidation = validateRequiredString(name, 'Name')
  if (!nameValidation.success) return badRequest(c, nameValidation.error)
  if (typeof type !== 'number' || Number.isNaN(type)) return badRequest(c, 'Type must be a number')
  const valueValidation = validateRequiredString(value, 'Value')
  if (!valueValidation.success) return badRequest(c, valueValidation.error)

  try {
    const row = await db.select().from(domain).where(eq(domain.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Domain not found')

    const updated = await db.update(domainAttrs).set({
      did: row[0].domain,
      name,
      type,
      value,
    }).where(eq(domainAttrs.id, attrParsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Domain attribute not found')
    return c.json({ attr: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

domainsRoute.delete('/:id/attrs/:attrId', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const attrParsed = parseIdParam(c.req.param('attrId'))
  if ('error' in attrParsed) return badRequest(c, attrParsed.error)

  try {
    const row = await db.select().from(domain).where(eq(domain.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Domain not found')

    const deleted = await db
      .delete(domainAttrs)
      .where(eq(domainAttrs.id, attrParsed.id))
      .returning()
    if (!deleted[0]) return notFound(c, 'Domain attribute not found')
    return c.json({ attr: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default domainsRoute
