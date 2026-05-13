import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { lcrGw, lcrRule, lcrRuleTarget } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'

const lcrRoute = new Hono()

lcrRoute.get('/gateways', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(lcrGw).limit(limit).offset(offset)
    return c.json({ gateways: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.post('/gateways', async (c) => {
  const body = await c.req.json()
  const { lcrId, gwName, ipAddr, hostname, port, params, uriScheme, transport, strip, prefix, tag, flags = 0, defunct } = body
  if (typeof lcrId !== 'number' || Number.isNaN(lcrId)) return badRequest(c, 'lcrId must be a number')
  try {
    const created = await db.insert(lcrGw).values({
      lcrId,
      gwName: typeof gwName === 'string' ? gwName : null,
      ipAddr: typeof ipAddr === 'string' ? ipAddr : null,
      hostname: typeof hostname === 'string' ? hostname : null,
      port: typeof port === 'number' ? port : null,
      params: typeof params === 'string' ? params : null,
      uriScheme: typeof uriScheme === 'number' ? uriScheme : null,
      transport: typeof transport === 'number' ? transport : null,
      strip: typeof strip === 'number' ? strip : null,
      prefix: typeof prefix === 'string' ? prefix : null,
      tag: typeof tag === 'string' ? tag : null,
      flags: typeof flags === 'number' ? flags : 0,
      defunct: typeof defunct === 'number' ? defunct : null,
    }).returning()
    return c.json({ gateway: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.put('/gateways/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { lcrId, gwName, ipAddr, hostname, port, params, uriScheme, transport, strip, prefix, tag, flags, defunct } = body
  if (typeof lcrId !== 'number' || Number.isNaN(lcrId)) return badRequest(c, 'lcrId must be a number')
  try {
    const updated = await db.update(lcrGw).set({
      lcrId,
      gwName: typeof gwName === 'string' ? gwName : null,
      ipAddr: typeof ipAddr === 'string' ? ipAddr : null,
      hostname: typeof hostname === 'string' ? hostname : null,
      port: typeof port === 'number' ? port : null,
      params: typeof params === 'string' ? params : null,
      uriScheme: typeof uriScheme === 'number' ? uriScheme : null,
      transport: typeof transport === 'number' ? transport : null,
      strip: typeof strip === 'number' ? strip : null,
      prefix: typeof prefix === 'string' ? prefix : null,
      tag: typeof tag === 'string' ? tag : null,
      flags: typeof flags === 'number' ? flags : 0,
      defunct: typeof defunct === 'number' ? defunct : null,
    }).where(eq(lcrGw.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Gateway not found')
    return c.json({ gateway: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.delete('/gateways/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const dependency = await db.select().from(lcrRuleTarget).where(eq(lcrRuleTarget.gwId, parsed.id)).limit(1)
    if (dependency[0]) return badRequest(c, 'Gateway is in use by at least one LCR rule target')

    const deleted = await db.delete(lcrGw).where(eq(lcrGw.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Gateway not found')
    return c.json({ gateway: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.get('/rules', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(lcrRule).limit(limit).offset(offset)
    return c.json({ rules: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.post('/rules', async (c) => {
  const body = await c.req.json()
  const { lcrId, prefix, fromUri, requestUri, mtTvalue, stopper = 0, enabled = 1 } = body
  if (typeof lcrId !== 'number' || Number.isNaN(lcrId)) return badRequest(c, 'lcrId must be a number')
  try {
    const created = await db.insert(lcrRule).values({
      lcrId,
      prefix: typeof prefix === 'string' ? prefix : null,
      fromUri: typeof fromUri === 'string' ? fromUri : null,
      requestUri: typeof requestUri === 'string' ? requestUri : null,
      mtTvalue: typeof mtTvalue === 'string' ? mtTvalue : null,
      stopper: typeof stopper === 'number' ? stopper : 0,
      enabled: typeof enabled === 'number' ? enabled : 1,
    }).returning()
    return c.json({ rule: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.put('/rules/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { lcrId, prefix, fromUri, requestUri, mtTvalue, stopper, enabled } = body
  if (typeof lcrId !== 'number' || Number.isNaN(lcrId)) return badRequest(c, 'lcrId must be a number')
  try {
    const updated = await db.update(lcrRule).set({
      lcrId,
      prefix: typeof prefix === 'string' ? prefix : null,
      fromUri: typeof fromUri === 'string' ? fromUri : null,
      requestUri: typeof requestUri === 'string' ? requestUri : null,
      mtTvalue: typeof mtTvalue === 'string' ? mtTvalue : null,
      stopper: typeof stopper === 'number' ? stopper : 0,
      enabled: typeof enabled === 'number' ? enabled : 1,
    }).where(eq(lcrRule.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Rule not found')
    return c.json({ rule: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.delete('/rules/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const dependency = await db.select().from(lcrRuleTarget).where(eq(lcrRuleTarget.ruleId, parsed.id)).limit(1)
    if (dependency[0]) return badRequest(c, 'Rule is in use by at least one LCR rule target')

    const deleted = await db.delete(lcrRule).where(eq(lcrRule.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Rule not found')
    return c.json({ rule: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.get('/rule-targets', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(lcrRuleTarget).limit(limit).offset(offset)
    return c.json({ ruleTargets: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.post('/rule-targets', async (c) => {
  const body = await c.req.json()
  const { lcrId, ruleId, gwId, priority, weight = 1 } = body
  if ([lcrId, ruleId, gwId, priority].some((value) => typeof value !== 'number' || Number.isNaN(value))) {
    return badRequest(c, 'lcrId, ruleId, gwId, and priority must be numbers')
  }
  if (typeof weight !== 'number' || Number.isNaN(weight)) return badRequest(c, 'weight must be a number')

  try {
    const rule = await db.select().from(lcrRule).where(and(eq(lcrRule.id, ruleId), eq(lcrRule.lcrId, lcrId))).limit(1)
    if (!rule[0]) return badRequest(c, 'Referenced LCR rule does not exist for the provided lcrId')

    const gateway = await db.select().from(lcrGw).where(and(eq(lcrGw.id, gwId), eq(lcrGw.lcrId, lcrId))).limit(1)
    if (!gateway[0]) return badRequest(c, 'Referenced LCR gateway does not exist for the provided lcrId')

    const created = await db.insert(lcrRuleTarget).values({ lcrId, ruleId, gwId, priority, weight }).returning()
    return c.json({ ruleTarget: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.put('/rule-targets/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { lcrId, ruleId, gwId, priority, weight = 1 } = body
  if ([lcrId, ruleId, gwId, priority].some((value) => typeof value !== 'number' || Number.isNaN(value))) {
    return badRequest(c, 'lcrId, ruleId, gwId, and priority must be numbers')
  }
  if (typeof weight !== 'number' || Number.isNaN(weight)) return badRequest(c, 'weight must be a number')

  try {
    const rule = await db.select().from(lcrRule).where(and(eq(lcrRule.id, ruleId), eq(lcrRule.lcrId, lcrId))).limit(1)
    if (!rule[0]) return badRequest(c, 'Referenced LCR rule does not exist for the provided lcrId')

    const gateway = await db.select().from(lcrGw).where(and(eq(lcrGw.id, gwId), eq(lcrGw.lcrId, lcrId))).limit(1)
    if (!gateway[0]) return badRequest(c, 'Referenced LCR gateway does not exist for the provided lcrId')

    const updated = await db.update(lcrRuleTarget).set({ lcrId, ruleId, gwId, priority, weight }).where(eq(lcrRuleTarget.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Rule target not found')
    return c.json({ ruleTarget: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

lcrRoute.delete('/rule-targets/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(lcrRuleTarget).where(eq(lcrRuleTarget.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Rule target not found')
    return c.json({ ruleTarget: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default lcrRoute
