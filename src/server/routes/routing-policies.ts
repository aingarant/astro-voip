import { Hono } from 'hono'
import { and, eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { describeRoute, resolver } from 'hono-openapi'
import { sValidator } from '@hono/standard-validator'
import { z } from 'zod'
import { db } from '../db'
import { accounts, routingPolicies } from '../db/schema'
import { badRequest, conflict, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateFlag01, validateRequiredString } from '../utils/validators'

const routingPoliciesRoute = new Hono()

const bodySchema = z.object({
  accountId: z.number(),
  domain: z.string().min(1, 'Domain is required'),
  name: z.string().min(1, 'Name is required'),
  maxAttempts: z.number().optional(),
  retryDelayMs: z.number().optional(),
  sip4xxAction: z.string().optional(),
  sip5xxAction: z.string().optional(),
  sip6xxAction: z.string().optional(),
  failoverActionType: z.string().optional(),
  failoverActionTarget: z.string().optional(),
  isActive: z.union([z.literal(0), z.literal(1)]).optional(),
})

const responseSchema = z.object({
  id: z.number(),
  accountId: z.number(),
  domain: z.string(),
  name: z.string(),
  maxAttempts: z.number(),
  retryDelayMs: z.number(),
  sip4xxAction: z.string(),
  sip5xxAction: z.string(),
  sip6xxAction: z.string(),
  failoverActionType: z.string(),
  failoverActionTarget: z.string(),
  isActive: z.number(),
  createDate: z.unknown(),
  updatedAt: z.unknown(),
})

const errorSchema = z.object({ error: z.string() })
const validationHook = (result: { success: boolean; error?: readonly { message: string }[] }, c: Parameters<typeof badRequest>[0]) => {
  if (!result.success) return badRequest(c, result.error?.[0]?.message ?? 'Invalid request')
}

routingPoliciesRoute.get(
  '/',
  describeRoute({
    tags: ['Routing'],
    summary: 'List routing policies',
    responses: {
      200: {
        description: 'Paginated routing policies',
        content: {
          'application/json': {
            schema: resolver(z.object({
              routingPolicies: z.array(responseSchema),
              page: z.object({ limit: z.number(), offset: z.number() }),
            })),
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
      const rows = await db.select().from(routingPolicies).limit(limit).offset(offset)
      return c.json({ routingPolicies: rows, page: { limit, offset } })
    } catch (error: unknown) {
      console.error(error)
      return internalError(c, error)
    }
  },
)

routingPoliciesRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(routingPolicies).where(eq(routingPolicies.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Routing policy not found')
    return c.json({ routingPolicy: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

routingPoliciesRoute.post(
  '/',
  describeRoute({
    tags: ['Routing'],
    summary: 'Create routing policy',
    responses: {
      201: {
        description: 'Created routing policy',
        content: { 'application/json': { schema: resolver(z.object({ routingPolicy: responseSchema })) } },
      },
      400: { description: 'Invalid request', content: { 'application/json': { schema: resolver(errorSchema) } } },
    },
  }),
  sValidator('json', bodySchema, validationHook),
  async (c) => {
    const {
      accountId,
      domain,
      name,
      maxAttempts = 3,
      retryDelayMs = 250,
      sip4xxAction = 'next-target',
      sip5xxAction = 'next-target',
      sip6xxAction = 'stop',
      failoverActionType = 'voicemail',
      failoverActionTarget = '',
      isActive = 1,
    } = c.req.valid('json')

    if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
    for (const [field, value] of Object.entries({ domain, name })) {
      const validation = validateRequiredString(value, field === 'domain' ? 'Domain' : 'Name')
      if (!validation.success) return badRequest(c, validation.error)
    }
    const statusValidation = validateFlag01(isActive, 'Is Active')
    if (!statusValidation.success) return badRequest(c, statusValidation.error)

    try {
      const account = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
      if (!account[0]) return badRequest(c, 'Account ID does not exist')

      const existing = await db
        .select()
        .from(routingPolicies)
        .where(and(eq(routingPolicies.accountId, accountId), eq(routingPolicies.domain, domain), eq(routingPolicies.name, name)))
        .limit(1)
      if (existing[0]) return conflict(c, 'Routing policy already exists for this account/domain/name')

      const created = await db.insert(routingPolicies).values({
        accountId,
        domain,
        name,
        maxAttempts,
        retryDelayMs,
        sip4xxAction,
        sip5xxAction,
        sip6xxAction,
        failoverActionType,
        failoverActionTarget,
        isActive,
      }).returning()
      return c.json({ routingPolicy: created[0] }, 201)
    } catch (error: unknown) {
      console.error(error)
      return internalError(c, error)
    }
  },
)

routingPoliciesRoute.put('/:id', sValidator('json', bodySchema, validationHook), async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const {
    accountId,
    domain,
    name,
    maxAttempts = 3,
    retryDelayMs = 250,
    sip4xxAction = 'next-target',
    sip5xxAction = 'next-target',
    sip6xxAction = 'stop',
    failoverActionType = 'voicemail',
    failoverActionTarget = '',
    isActive = 1,
  } = c.req.valid('json')
  const statusValidation = validateFlag01(isActive, 'Is Active')
  if (!statusValidation.success) return badRequest(c, statusValidation.error)

  try {
    const existing = await db.select().from(routingPolicies).where(eq(routingPolicies.id, parsed.id)).limit(1)
    if (!existing[0]) return notFound(c, 'Routing policy not found')

    const duplicate = await db
      .select()
      .from(routingPolicies)
      .where(and(eq(routingPolicies.accountId, accountId), eq(routingPolicies.domain, domain), eq(routingPolicies.name, name)))
      .limit(1)
    if (duplicate[0] && duplicate[0].id !== parsed.id) {
      return conflict(c, 'Another routing policy already uses this account/domain/name')
    }

    const updated = await db.update(routingPolicies).set({
      accountId,
      domain,
      name,
      maxAttempts,
      retryDelayMs,
      sip4xxAction,
      sip5xxAction,
      sip6xxAction,
      failoverActionType,
      failoverActionTarget,
      isActive,
    }).where(eq(routingPolicies.id, parsed.id)).returning()
    return c.json({ routingPolicy: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

routingPoliciesRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(routingPolicies).where(eq(routingPolicies.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Routing policy not found')
    return c.json({ routingPolicy: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default routingPoliciesRoute
export type RoutingPolicy = InferSelectModel<typeof routingPolicies>
export type NewRoutingPolicy = InferInsertModel<typeof routingPolicies>
