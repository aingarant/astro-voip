import { Hono } from 'hono'
import { db } from '../db'
import { accounts as accountsDb } from '../db/schema'
import { and, eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { badRequest, conflict, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateFlag01, validateRequiredString } from '../utils/validators'
const accountsRoute = new Hono()

accountsRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const accountsData = await db.select().from(accountsDb).limit(limit).offset(offset)
    return c.json({ accounts: accountsData, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

accountsRoute.get('/:id', async (c) => {
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
accountsRoute.post('/', async (c) => {
  const body = await c.req.json()
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
accountsRoute.put('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = await c.req.json()
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

accountsRoute.patch('/:id/status', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = await c.req.json()
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

accountsRoute.delete('/:id', async (c) => {
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