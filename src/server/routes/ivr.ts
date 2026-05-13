import { Hono } from 'hono'
import { and, eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { describeRoute, resolver } from 'hono-openapi'
import { sValidator } from '@hono/standard-validator'
import { z } from 'zod'
import { db } from '../db'
import { accounts, ivrProfiles } from '../db/schema'
import { badRequest, conflict, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateFlag01, validateRequiredString } from '../utils/validators'
import { getTenantScopeFromQuery } from '../utils/tenant'
import { writeTenantAuditLog } from '../utils/audit'

const ivrRoute = new Hono()

const ivrBodySchema = z.object({
  accountId: z.number(),
  domain: z.string().min(1, 'Domain is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  defaultLanguage: z.string().optional(),
  timezone: z.string().optional(),
  activeVersionId: z.number().nullable().optional(),
  isActive: z.union([z.literal(0), z.literal(1)]).optional(),
})

const ivrStatusBodySchema = z.object({
  isActive: z.union([z.literal(0), z.literal(1)]),
})

const ivrResponseSchema = z.object({
  id: z.number(),
  accountId: z.number(),
  domain: z.string(),
  name: z.string(),
  description: z.string(),
  activeVersionId: z.number().nullable(),
  defaultLanguage: z.string(),
  timezone: z.string(),
  isActive: z.number(),
  createDate: z.unknown(),
  updatedAt: z.unknown(),
})

const errorSchema = z.object({ error: z.string() })
const validationHook = (result: { success: boolean; error?: readonly { message: string }[] }, c: Parameters<typeof badRequest>[0]) => {
  if (!result.success) return badRequest(c, result.error?.[0]?.message ?? 'Invalid request')
}

ivrRoute.get(
  '/',
  describeRoute({
    tags: ['IVR'],
    summary: 'List IVR profiles',
    responses: {
      200: {
        description: 'Paginated IVR profiles',
        content: {
          'application/json': {
            schema: resolver(z.object({
              ivrProfiles: z.array(ivrResponseSchema),
              page: z.object({ limit: z.number(), offset: z.number() }),
            })),
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const tenant = getTenantScopeFromQuery(c)
      if ('error' in tenant) return badRequest(c, tenant.error)
      const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
      const rows = await db
        .select()
        .from(ivrProfiles)
        .where(and(eq(ivrProfiles.accountId, tenant.accountId), eq(ivrProfiles.domain, tenant.domain)))
        .limit(limit)
        .offset(offset)
      return c.json({ ivrProfiles: rows, page: { limit, offset } })
    } catch (error: unknown) {
      console.error(error)
      return internalError(c, error)
    }
  },
)

ivrRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const tenant = getTenantScopeFromQuery(c)
  if ('error' in tenant) return badRequest(c, tenant.error)
  try {
    const row = await db
      .select()
      .from(ivrProfiles)
      .where(and(eq(ivrProfiles.id, parsed.id), eq(ivrProfiles.accountId, tenant.accountId), eq(ivrProfiles.domain, tenant.domain)))
      .limit(1)
    if (!row[0]) return notFound(c, 'IVR profile not found')
    return c.json({ ivrProfile: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

ivrRoute.post(
  '/',
  describeRoute({
    tags: ['IVR'],
    summary: 'Create IVR profile',
    responses: {
      201: {
        description: 'Created IVR profile',
        content: {
          'application/json': { schema: resolver(z.object({ ivrProfile: ivrResponseSchema })) },
        },
      },
      400: { description: 'Invalid request', content: { 'application/json': { schema: resolver(errorSchema) } } },
    },
  }),
  sValidator('json', ivrBodySchema, validationHook),
  async (c) => {
    const body = c.req.valid('json')
    const {
      accountId,
      domain,
      name,
      description = '',
      activeVersionId = null,
      defaultLanguage = 'en-US',
      timezone = 'UTC',
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
        .from(ivrProfiles)
        .where(and(eq(ivrProfiles.accountId, accountId), eq(ivrProfiles.domain, domain), eq(ivrProfiles.name, name)))
        .limit(1)
      if (existing[0]) return conflict(c, 'IVR profile already exists for this account/domain/name')

      const created = await db.insert(ivrProfiles).values({
        accountId,
        domain,
        name,
        description,
        activeVersionId,
        defaultLanguage,
        timezone,
        isActive,
      }).returning()
      await writeTenantAuditLog(c, {
        accountId,
        domain,
        entityType: 'ivr_profile',
        entityId: created[0].id,
        action: 'create',
        afterPayload: created[0],
      })
      return c.json({ ivrProfile: created[0] }, 201)
    } catch (error: unknown) {
      console.error(error)
      return internalError(c, error)
    }
  },
)

ivrRoute.put('/:id', sValidator('json', ivrBodySchema, validationHook), async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = c.req.valid('json')
  const {
    accountId,
    domain,
    name,
    description = '',
    activeVersionId = null,
    defaultLanguage = 'en-US',
    timezone = 'UTC',
    isActive = 1,
  } = body

  if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
  const statusValidation = validateFlag01(isActive, 'Is Active')
  if (!statusValidation.success) return badRequest(c, statusValidation.error)

  try {
    const existing = await db.select().from(ivrProfiles).where(eq(ivrProfiles.id, parsed.id)).limit(1)
    if (!existing[0]) return notFound(c, 'IVR profile not found')
    if (existing[0].accountId !== accountId || existing[0].domain !== domain) {
      return badRequest(c, 'accountId and domain must match the existing IVR profile tenant')
    }

    const duplicate = await db
      .select()
      .from(ivrProfiles)
      .where(and(eq(ivrProfiles.accountId, accountId), eq(ivrProfiles.domain, domain), eq(ivrProfiles.name, name)))
      .limit(1)
    if (duplicate[0] && duplicate[0].id !== parsed.id) {
      return conflict(c, 'Another IVR profile already uses this account/domain/name')
    }

    const updated = await db.update(ivrProfiles).set({
      accountId,
      domain,
      name,
      description,
      activeVersionId,
      defaultLanguage,
      timezone,
      isActive,
    }).where(eq(ivrProfiles.id, parsed.id)).returning()
    await writeTenantAuditLog(c, {
      accountId,
      domain,
      entityType: 'ivr_profile',
      entityId: parsed.id,
      action: 'update',
      beforePayload: existing[0],
      afterPayload: updated[0],
    })
    return c.json({ ivrProfile: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

ivrRoute.patch('/:id/status', sValidator('json', ivrStatusBodySchema, validationHook), async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const tenant = getTenantScopeFromQuery(c)
  if ('error' in tenant) return badRequest(c, tenant.error)
  const { isActive } = c.req.valid('json')
  const statusValidation = validateFlag01(isActive, 'Is Active')
  if (!statusValidation.success) return badRequest(c, statusValidation.error)

  try {
    const existing = await db
      .select()
      .from(ivrProfiles)
      .where(and(eq(ivrProfiles.id, parsed.id), eq(ivrProfiles.accountId, tenant.accountId), eq(ivrProfiles.domain, tenant.domain)))
      .limit(1)
    if (!existing[0]) return notFound(c, 'IVR profile not found')

    const updated = await db
      .update(ivrProfiles)
      .set({ isActive })
      .where(and(eq(ivrProfiles.id, parsed.id), eq(ivrProfiles.accountId, tenant.accountId), eq(ivrProfiles.domain, tenant.domain)))
      .returning()
    if (!updated[0]) return notFound(c, 'IVR profile not found')
    await writeTenantAuditLog(c, {
      accountId: tenant.accountId,
      domain: tenant.domain,
      entityType: 'ivr_profile',
      entityId: parsed.id,
      action: 'status_update',
      beforePayload: existing[0],
      afterPayload: updated[0],
    })
    return c.json({ ivrProfile: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

ivrRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const tenant = getTenantScopeFromQuery(c)
  if ('error' in tenant) return badRequest(c, tenant.error)
  try {
    const existing = await db
      .select()
      .from(ivrProfiles)
      .where(and(eq(ivrProfiles.id, parsed.id), eq(ivrProfiles.accountId, tenant.accountId), eq(ivrProfiles.domain, tenant.domain)))
      .limit(1)
    if (!existing[0]) return notFound(c, 'IVR profile not found')

    const deleted = await db
      .delete(ivrProfiles)
      .where(and(eq(ivrProfiles.id, parsed.id), eq(ivrProfiles.accountId, tenant.accountId), eq(ivrProfiles.domain, tenant.domain)))
      .returning()
    if (!deleted[0]) return notFound(c, 'IVR profile not found')
    await writeTenantAuditLog(c, {
      accountId: tenant.accountId,
      domain: tenant.domain,
      entityType: 'ivr_profile',
      entityId: parsed.id,
      action: 'delete',
      beforePayload: existing[0],
    })
    return c.json({ ivrProfile: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default ivrRoute
export type IvrProfile = InferSelectModel<typeof ivrProfiles>
export type NewIvrProfile = InferInsertModel<typeof ivrProfiles>
