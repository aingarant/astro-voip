import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { address, trusted } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateRequiredString } from '../utils/validators'

const trustRoute = new Hono()

trustRoute.get('/trusted', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(trusted).limit(limit).offset(offset)
    return c.json({ trusted: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

trustRoute.post('/trusted', async (c) => {
  const body = await c.req.json()
  const { srcIp, proto, fromPattern, ruriPattern, tag, priority = 0 } = body

  const srcIpValidation = validateRequiredString(srcIp, 'srcIp')
  if (!srcIpValidation.success) return badRequest(c, srcIpValidation.error)
  const protoValidation = validateRequiredString(proto, 'proto')
  if (!protoValidation.success) return badRequest(c, protoValidation.error)

  try {
    const created = await db.insert(trusted).values({
      srcIp,
      proto,
      fromPattern: typeof fromPattern === 'string' ? fromPattern : null,
      ruriPattern: typeof ruriPattern === 'string' ? ruriPattern : null,
      tag: typeof tag === 'string' ? tag : null,
      priority: typeof priority === 'number' ? priority : 0,
    }).returning()
    return c.json({ trusted: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

trustRoute.put('/trusted/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { srcIp, proto, fromPattern, ruriPattern, tag, priority } = body

  const srcIpValidation = validateRequiredString(srcIp, 'srcIp')
  if (!srcIpValidation.success) return badRequest(c, srcIpValidation.error)
  const protoValidation = validateRequiredString(proto, 'proto')
  if (!protoValidation.success) return badRequest(c, protoValidation.error)

  try {
    const updated = await db.update(trusted).set({
      srcIp,
      proto,
      fromPattern: typeof fromPattern === 'string' ? fromPattern : null,
      ruriPattern: typeof ruriPattern === 'string' ? ruriPattern : null,
      tag: typeof tag === 'string' ? tag : null,
      priority: typeof priority === 'number' ? priority : 0,
    }).where(eq(trusted.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Trusted rule not found')
    return c.json({ trusted: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

trustRoute.delete('/trusted/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(trusted).where(eq(trusted.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Trusted rule not found')
    return c.json({ trusted: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

trustRoute.get('/addresses', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(address).limit(limit).offset(offset)
    return c.json({ addresses: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

trustRoute.post('/addresses', async (c) => {
  const body = await c.req.json()
  const { grp = 1, ipAddr, mask = 32, port = 0, tag } = body
  if (typeof grp !== 'number' || Number.isNaN(grp)) return badRequest(c, 'grp must be a number')
  const ipValidation = validateRequiredString(ipAddr, 'ipAddr')
  if (!ipValidation.success) return badRequest(c, ipValidation.error)
  if (typeof mask !== 'number' || Number.isNaN(mask)) return badRequest(c, 'mask must be a number')
  if (typeof port !== 'number' || Number.isNaN(port)) return badRequest(c, 'port must be a number')
  try {
    const created = await db.insert(address).values({
      grp,
      ipAddr,
      mask,
      port,
      tag: typeof tag === 'string' ? tag : null,
    }).returning()
    return c.json({ address: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

trustRoute.put('/addresses/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { grp, ipAddr, mask, port, tag } = body
  if (typeof grp !== 'number' || Number.isNaN(grp)) return badRequest(c, 'grp must be a number')
  const ipValidation = validateRequiredString(ipAddr, 'ipAddr')
  if (!ipValidation.success) return badRequest(c, ipValidation.error)
  if (typeof mask !== 'number' || Number.isNaN(mask)) return badRequest(c, 'mask must be a number')
  if (typeof port !== 'number' || Number.isNaN(port)) return badRequest(c, 'port must be a number')
  try {
    const updated = await db.update(address).set({
      grp,
      ipAddr,
      mask,
      port,
      tag: typeof tag === 'string' ? tag : null,
    }).where(eq(address.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Address entry not found')
    return c.json({ address: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

trustRoute.delete('/addresses/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(address).where(eq(address.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Address entry not found')
    return c.json({ address: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default trustRoute
