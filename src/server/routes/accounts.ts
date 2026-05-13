import { Hono } from 'hono'
import { db } from '../db'
import { accounts as accountsDb } from '../db/schema'
import { and, eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { describeRoute, resolver } from 'hono-openapi'
import { sValidator } from '@hono/standard-validator'
import { z } from 'zod'
import { badRequest, conflict, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateFlag01, validateRequiredString } from '../utils/validators'
const accountsRoute = new Hono()

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const accountBodySchema = z.object({
  extAccountId: z.string().min(1, 'External Account ID is required'),
  domain: z.string().min(1, 'Domain is required'),
})

const accountUpdateBodySchema = accountBodySchema.extend({
  isActive: z.union([z.literal(0), z.literal(1)]),
})

const accountStatusBodySchema = z.object({
  isActive: z.union([z.literal(0), z.literal(1)]),
})

const accountResponseSchema = z.object({
  id: z.number(),
  extAccountId: z.string(),
  domain: z.string(),
  isActive: z.number(),
  createDate: z.unknown(),
})

const errorSchema = z.object({ error: z.string() })
const validationHook = (result: { success: boolean; error?: readonly { message: string }[] }, c: Parameters<typeof badRequest>[0]) => {
  if (!result.success) {
    return badRequest(c, result.error?.[0]?.message ?? 'Invalid request')
  }
}

accountsRoute.get(
  '/',
  describeRoute({
    tags: ['Accounts'],
    summary: 'List accounts',
    responses: {
      200: {
        description: 'Paginated list of accounts',
        content: {
          'application/json': {
            schema: resolver(z.object({
              accounts: z.array(accountResponseSchema),
              page: z.object({
                limit: z.number(),
                offset: z.number(),
              }),
            })),
          },
        },
      },
      500: {
        description: 'Server error',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
    },
  }),
  async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const accountsData = await db.select().from(accountsDb).limit(limit).offset(offset)
    return c.json({ accounts: accountsData, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

accountsRoute.get(
  '/:id',
  describeRoute({
    tags: ['Accounts'],
    summary: 'Get account by ID',
    responses: {
      200: {
        description: 'Account details',
        content: {
          'application/json': { schema: resolver(z.object({ account: accountResponseSchema })) },
        },
      },
      400: {
        description: 'Invalid ID',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
      404: {
        description: 'Account not found',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
    },
  }),
  async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  try {
    const account = await db.select().from(accountsDb).where(eq(accountsDb.id, parsed.id)).limit(1)
    if (!account[0]) {
      return notFound(c, 'Account not found')
    }
    return c.json({ account: account[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

// Create New Account
accountsRoute.post(
  '/',
  describeRoute({
    tags: ['Accounts'],
    summary: 'Create account',
    responses: {
      201: {
        description: 'Created account',
        content: {
          'application/json': { schema: resolver(z.object({ account: accountResponseSchema })) },
        },
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
      409: {
        description: 'Duplicate account',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
    },
  }),
  sValidator('json', accountBodySchema, validationHook),
  async (c) => {
  const body = c.req.valid('json')
  const { extAccountId, domain } = body

  const extAccountIdValidation = validateRequiredString(extAccountId, 'External Account ID')
  if (!extAccountIdValidation.success) return badRequest(c, extAccountIdValidation.error)

  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)

  try {
    const existingAccount = await db
      .select()
      .from(accountsDb)
      .where(and(eq(accountsDb.extAccountId, extAccountId), eq(accountsDb.domain, domain)))
      .limit(1)

    if (existingAccount[0]) {
      return conflict(c, 'Account already exists for this extAccountId and domain')
    }

    const account = await db.insert(accountsDb).values({
      extAccountId: extAccountId,
      domain: domain,
      isActive: 1
    }).returning()

    return c.json({ account: account[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

// update an account
accountsRoute.put(
  '/:id',
  describeRoute({
    tags: ['Accounts'],
    summary: 'Update account',
    responses: {
      200: {
        description: 'Updated account',
        content: {
          'application/json': { schema: resolver(z.object({ account: accountResponseSchema })) },
        },
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
      404: {
        description: 'Account not found',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
      409: {
        description: 'Duplicate account',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
    },
  }),
  sValidator('json', accountUpdateBodySchema, validationHook),
  async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = c.req.valid('json')
  const { extAccountId, domain, isActive } = body

  const extAccountIdValidation = validateRequiredString(extAccountId, 'External Account ID')
  if (!extAccountIdValidation.success) return badRequest(c, extAccountIdValidation.error)
  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  if (isActive === undefined) return badRequest(c, 'Is Active is required')
  const isActiveValidation = validateFlag01(isActive, 'Is Active')
  if (!isActiveValidation.success) return badRequest(c, isActiveValidation.error)

  try {
    const existingAccount = await db.select().from(accountsDb).where(eq(accountsDb.id, parsed.id)).limit(1)
    if (!existingAccount[0]) return notFound(c, 'Account not found')

    const duplicate = await db
      .select()
      .from(accountsDb)
      .where(and(eq(accountsDb.extAccountId, extAccountId), eq(accountsDb.domain, domain)))
      .limit(1)

    if (duplicate[0] && duplicate[0].id !== parsed.id) {
      return conflict(c, 'Another account already uses this extAccountId and domain')
    }

    const account = await db.update(accountsDb).set({
      extAccountId: extAccountId,
      domain: domain,
      isActive: isActive,
    }).where(eq(accountsDb.id, parsed.id)).returning()
    return c.json({ account: account[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

accountsRoute.patch(
  '/:id/status',
  describeRoute({
    tags: ['Accounts'],
    summary: 'Update account status',
    responses: {
      200: {
        description: 'Updated account status',
        content: {
          'application/json': { schema: resolver(z.object({ account: accountResponseSchema })) },
        },
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
      404: {
        description: 'Account not found',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
    },
  }),
  sValidator('json', accountStatusBodySchema, validationHook),
  async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = c.req.valid('json')
  const { isActive } = body
  if (isActive === undefined) return badRequest(c, 'Is Active is required')
  const isActiveValidation = validateFlag01(isActive, 'Is Active')
  if (!isActiveValidation.success) return badRequest(c, isActiveValidation.error)

  try {
    const account = await db
      .update(accountsDb)
      .set({ isActive })
      .where(eq(accountsDb.id, parsed.id))
      .returning()
    if (!account[0]) return notFound(c, 'Account not found')
    return c.json({ account: account[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

accountsRoute.delete(
  '/:id',
  describeRoute({
    tags: ['Accounts'],
    summary: 'Soft-delete account',
    responses: {
      200: {
        description: 'Soft-deleted account',
        content: {
          'application/json': { schema: resolver(z.object({ account: accountResponseSchema })) },
        },
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
      404: {
        description: 'Account not found',
        content: { 'application/json': { schema: resolver(errorSchema) } },
      },
    },
  }),
  sValidator('param', idParamSchema, validationHook),
  async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  try {
    const account = await db
      .update(accountsDb)
      .set({ isActive: 0 })
      .where(eq(accountsDb.id, parsed.id))
      .returning()
    if (!account[0]) return notFound(c, 'Account not found')
    return c.json({ account: account[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default accountsRoute

export type Account = InferSelectModel<typeof accountsDb>
export type NewAccount = InferInsertModel<typeof accountsDb>