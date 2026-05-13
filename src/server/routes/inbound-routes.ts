import { Hono } from 'hono'
import { and, eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { describeRoute, resolver } from 'hono-openapi'
import { sValidator } from '@hono/standard-validator'
import { z } from 'zod'
import { db } from '../db'
import { accounts, holidayCalendars, inboundRoutes, recordingPolicies, routingPolicies, timeConditions } from '../db/schema'
import { badRequest, conflict, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateFlag01, validateRequiredString } from '../utils/validators'

const inboundRoutesRoute = new Hono()

const bodySchema = z.object({
  accountId: z.number(),
  domain: z.string().min(1, 'Domain is required'),
  did: z.string().min(1, 'DID is required'),
  priority: z.number().optional(),
  timeConditionId: z.number().nullable().optional(),
  holidayCalendarId: z.number().nullable().optional(),
  routingPolicyId: z.number().nullable().optional(),
  recordingPolicyId: z.number().nullable().optional(),
  targetType: z.string().min(1, 'Target Type is required'),
  targetValue: z.string().min(1, 'Target Value is required'),
  fallbackTargetType: z.string().optional(),
  fallbackTargetValue: z.string().optional(),
  isEmergency: z.union([z.literal(0), z.literal(1)]).optional(),
  isActive: z.union([z.literal(0), z.literal(1)]).optional(),
})

const responseSchema = z.object({
  id: z.number(),
  accountId: z.number(),
  domain: z.string(),
  did: z.string(),
  priority: z.number(),
  targetType: z.string(),
  targetValue: z.string(),
  fallbackTargetType: z.string(),
  fallbackTargetValue: z.string(),
  isEmergency: z.number(),
  isActive: z.number(),
  createDate: z.unknown(),
  updatedAt: z.unknown(),
})

const errorSchema = z.object({ error: z.string() })
const validationHook = (result: { success: boolean; error?: readonly { message: string }[] }, c: Parameters<typeof badRequest>[0]) => {
  if (!result.success) return badRequest(c, result.error?.[0]?.message ?? 'Invalid request')
}

inboundRoutesRoute.get(
  '/',
  describeRoute({
    tags: ['Routing'],
    summary: 'List inbound routes',
    responses: {
      200: {
        description: 'Paginated inbound routes',
        content: {
          'application/json': {
            schema: resolver(z.object({
              inboundRoutes: z.array(responseSchema),
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
      const rows = await db.select().from(inboundRoutes).limit(limit).offset(offset)
      return c.json({ inboundRoutes: rows, page: { limit, offset } })
    } catch (error: unknown) {
      console.error(error)
      return internalError(c, error)
    }
  },
)

inboundRoutesRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(inboundRoutes).where(eq(inboundRoutes.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Inbound route not found')
    return c.json({ inboundRoute: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

inboundRoutesRoute.post(
  '/',
  describeRoute({
    tags: ['Routing'],
    summary: 'Create inbound route',
    responses: {
      201: {
        description: 'Created inbound route',
        content: { 'application/json': { schema: resolver(z.object({ inboundRoute: responseSchema })) } },
      },
      400: { description: 'Invalid request', content: { 'application/json': { schema: resolver(errorSchema) } } },
    },
  }),
  sValidator('json', bodySchema, validationHook),
  async (c) => {
    const {
      accountId,
      domain,
      did,
      priority = 0,
      timeConditionId = null,
      holidayCalendarId = null,
      routingPolicyId = null,
      recordingPolicyId = null,
      targetType,
      targetValue,
      fallbackTargetType = 'voicemail',
      fallbackTargetValue = '',
      isEmergency = 0,
      isActive = 1,
    } = c.req.valid('json')

    if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
    for (const [label, value] of Object.entries({ Domain: domain, DID: did, 'Target Type': targetType, 'Target Value': targetValue })) {
      const validation = validateRequiredString(value, label)
      if (!validation.success) return badRequest(c, validation.error)
    }
    const statusValidation = validateFlag01(isActive, 'Is Active')
    if (!statusValidation.success) return badRequest(c, statusValidation.error)
    const emergencyValidation = validateFlag01(isEmergency, 'Is Emergency')
    if (!emergencyValidation.success) return badRequest(c, emergencyValidation.error)

    try {
      const account = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
      if (!account[0]) return badRequest(c, 'Account ID does not exist')

      if (timeConditionId !== null) {
        const row = await db.select().from(timeConditions).where(eq(timeConditions.id, timeConditionId)).limit(1)
        if (!row[0]) return badRequest(c, 'Time condition does not exist')
      }
      if (holidayCalendarId !== null) {
        const row = await db.select().from(holidayCalendars).where(eq(holidayCalendars.id, holidayCalendarId)).limit(1)
        if (!row[0]) return badRequest(c, 'Holiday calendar does not exist')
      }
      if (routingPolicyId !== null) {
        const row = await db.select().from(routingPolicies).where(eq(routingPolicies.id, routingPolicyId)).limit(1)
        if (!row[0]) return badRequest(c, 'Routing policy does not exist')
      }
      if (recordingPolicyId !== null) {
        const row = await db.select().from(recordingPolicies).where(eq(recordingPolicies.id, recordingPolicyId)).limit(1)
        if (!row[0]) return badRequest(c, 'Recording policy does not exist')
      }

      const existing = await db.select().from(inboundRoutes).where(and(
        eq(inboundRoutes.accountId, accountId),
        eq(inboundRoutes.domain, domain),
        eq(inboundRoutes.did, did),
        eq(inboundRoutes.priority, priority),
      )).limit(1)
      if (existing[0]) return conflict(c, 'Inbound route already exists for this account/domain/did/priority')

      const created = await db.insert(inboundRoutes).values({
        accountId,
        domain,
        did,
        priority,
        timeConditionId,
        holidayCalendarId,
        routingPolicyId,
        recordingPolicyId,
        targetType,
        targetValue,
        fallbackTargetType,
        fallbackTargetValue,
        isEmergency,
        isActive,
      }).returning()
      return c.json({ inboundRoute: created[0] }, 201)
    } catch (error: unknown) {
      console.error(error)
      return internalError(c, error)
    }
  },
)

inboundRoutesRoute.put('/:id', sValidator('json', bodySchema, validationHook), async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const {
    accountId,
    domain,
    did,
    priority = 0,
    timeConditionId = null,
    holidayCalendarId = null,
    routingPolicyId = null,
    recordingPolicyId = null,
    targetType,
    targetValue,
    fallbackTargetType = 'voicemail',
    fallbackTargetValue = '',
    isEmergency = 0,
    isActive = 1,
  } = c.req.valid('json')

  const statusValidation = validateFlag01(isActive, 'Is Active')
  if (!statusValidation.success) return badRequest(c, statusValidation.error)
  const emergencyValidation = validateFlag01(isEmergency, 'Is Emergency')
  if (!emergencyValidation.success) return badRequest(c, emergencyValidation.error)

  try {
    const existing = await db.select().from(inboundRoutes).where(eq(inboundRoutes.id, parsed.id)).limit(1)
    if (!existing[0]) return notFound(c, 'Inbound route not found')

    const duplicate = await db.select().from(inboundRoutes).where(and(
      eq(inboundRoutes.accountId, accountId),
      eq(inboundRoutes.domain, domain),
      eq(inboundRoutes.did, did),
      eq(inboundRoutes.priority, priority),
    )).limit(1)
    if (duplicate[0] && duplicate[0].id !== parsed.id) {
      return conflict(c, 'Another inbound route already uses this account/domain/did/priority')
    }

    const updated = await db.update(inboundRoutes).set({
      accountId,
      domain,
      did,
      priority,
      timeConditionId,
      holidayCalendarId,
      routingPolicyId,
      recordingPolicyId,
      targetType,
      targetValue,
      fallbackTargetType,
      fallbackTargetValue,
      isEmergency,
      isActive,
    }).where(eq(inboundRoutes.id, parsed.id)).returning()
    return c.json({ inboundRoute: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

inboundRoutesRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(inboundRoutes).where(eq(inboundRoutes.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Inbound route not found')
    return c.json({ inboundRoute: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default inboundRoutesRoute
export type InboundRoute = InferSelectModel<typeof inboundRoutes>
export type NewInboundRoute = InferInsertModel<typeof inboundRoutes>
