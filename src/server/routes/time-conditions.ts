import { Hono } from 'hono'
import { and, eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { describeRoute, resolver } from 'hono-openapi'
import { sValidator } from '@hono/standard-validator'
import { z } from 'zod'
import { db } from '../db'
import { accounts, timeConditions } from '../db/schema'
import { badRequest, conflict, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateFlag01, validateRequiredString } from '../utils/validators'

const timeConditionsRoute = new Hono()

const bodySchema = z.object({
  accountId: z.number(),
  domain: z.string().min(1, 'Domain is required'),
  name: z.string().min(1, 'Name is required'),
  timezone: z.string().optional(),
  matchActionType: z.string().optional(),
  noMatchActionType: z.string().optional(),
  noMatchActionTarget: z.string().optional(),
  isActive: z.union([z.literal(0), z.literal(1)]).optional(),
})

const responseSchema = z.object({
  id: z.number(),
  accountId: z.number(),
  domain: z.string(),
  name: z.string(),
  timezone: z.string(),
  matchActionType: z.string(),
  noMatchActionType: z.string(),
  noMatchActionTarget: z.string(),
  isActive: z.number(),
  createDate: z.unknown(),
  updatedAt: z.unknown(),
})

const errorSchema = z.object({ error: z.string() })
const validationHook = (result: { success: boolean; error?: readonly { message: string }[] }, c: Parameters<typeof badRequest>[0]) => {
  if (!result.success) return badRequest(c, result.error?.[0]?.message ?? 'Invalid request')
}

timeConditionsRoute.get(
  '/',
  describeRoute({
    tags: ['Routing'],
    summary: 'List time conditions',
    responses: {
      200: {
        description: 'Paginated time conditions',
        content: {
          'application/json': {
            schema: resolver(z.object({
              timeConditions: z.array(responseSchema),
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
      const rows = await db.select().from(timeConditions).limit(limit).offset(offset)
      return c.json({ timeConditions: rows, page: { limit, offset } })
    } catch (error: unknown) {
      console.error(error)
      return internalError(c, error)
    }
  },
)

timeConditionsRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(timeConditions).where(eq(timeConditions.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Time condition not found')
    return c.json({ timeCondition: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

timeConditionsRoute.post(
  '/',
  describeRoute({
    tags: ['Routing'],
    summary: 'Create time condition',
    responses: {
      201: {
        description: 'Created time condition',
        content: { 'application/json': { schema: resolver(z.object({ timeCondition: responseSchema })) } },
      },
      400: { description: 'Invalid request', content: { 'application/json': { schema: resolver(errorSchema) } } },
    },
  }),
  sValidator('json', bodySchema, validationHook),
  async (c) => {
    const body = c.req.valid('json')
    const {
      accountId,
      domain,
      name,
      timezone = 'UTC',
      matchActionType = 'allow',
      noMatchActionType = 'deny',
      noMatchActionTarget = '',
      isActive = 1,
    } = body

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
        .from(timeConditions)
        .where(and(eq(timeConditions.accountId, accountId), eq(timeConditions.domain, domain), eq(timeConditions.name, name)))
        .limit(1)
      if (existing[0]) return conflict(c, 'Time condition already exists for this account/domain/name')

      const created = await db.insert(timeConditions).values({
        accountId,
        domain,
        name,
        timezone,
        matchActionType,
        noMatchActionType,
        noMatchActionTarget,
        isActive,
      }).returning()
      return c.json({ timeCondition: created[0] }, 201)
    } catch (error: unknown) {
      console.error(error)
      return internalError(c, error)
    }
  },
)

timeConditionsRoute.put('/:id', sValidator('json', bodySchema, validationHook), async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const {
    accountId,
    domain,
    name,
    timezone = 'UTC',
    matchActionType = 'allow',
    noMatchActionType = 'deny',
    noMatchActionTarget = '',
    isActive = 1,
  } = c.req.valid('json')

  const statusValidation = validateFlag01(isActive, 'Is Active')
  if (!statusValidation.success) return badRequest(c, statusValidation.error)

  try {
    const existing = await db.select().from(timeConditions).where(eq(timeConditions.id, parsed.id)).limit(1)
    if (!existing[0]) return notFound(c, 'Time condition not found')

    const duplicate = await db
      .select()
      .from(timeConditions)
      .where(and(eq(timeConditions.accountId, accountId), eq(timeConditions.domain, domain), eq(timeConditions.name, name)))
      .limit(1)
    if (duplicate[0] && duplicate[0].id !== parsed.id) {
      return conflict(c, 'Another time condition already uses this account/domain/name')
    }

    const updated = await db.update(timeConditions).set({
      accountId,
      domain,
      name,
      timezone,
      matchActionType,
      noMatchActionType,
      noMatchActionTarget,
      isActive,
    }).where(eq(timeConditions.id, parsed.id)).returning()
    return c.json({ timeCondition: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

timeConditionsRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(timeConditions).where(eq(timeConditions.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Time condition not found')
    return c.json({ timeCondition: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default timeConditionsRoute
export type TimeCondition = InferSelectModel<typeof timeConditions>
export type NewTimeCondition = InferInsertModel<typeof timeConditions>
