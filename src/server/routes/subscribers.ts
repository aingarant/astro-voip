import { Hono } from 'hono'
import { db } from '../db'
import { accounts, subscriber as subscriberDb } from '../db/schema'
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { buildSubscriberDigests, sanitizeSubscriber } from '../utils/subscriber'
import { validateRequiredString } from '../utils/validators'
const subscribersRoute = new Hono()

subscribersRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const subscribersData = await db.select().from(subscriberDb).limit(limit).offset(offset)
    return c.json({ subscribers: subscribersData.map(sanitizeSubscriber), page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

subscribersRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  try {
    const record = await db.select().from(subscriberDb).where(eq(subscriberDb.id, parsed.id)).limit(1)
    if (!record[0]) return notFound(c, 'Subscriber not found')
    return c.json({ subscriber: sanitizeSubscriber(record[0]) })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

// Create New Subscriber
subscribersRoute.post('/', async (c) => {
  const body = await c.req.json()

  const { accountId, extensionId, defaultDid, username, domain, password } = body

  if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
  const extensionValidation = validateRequiredString(extensionId, 'Extension ID')
  if (!extensionValidation.success) return badRequest(c, extensionValidation.error)
  const didValidation = validateRequiredString(defaultDid, 'Default DID')
  if (!didValidation.success) return badRequest(c, didValidation.error)
  const usernameValidation = validateRequiredString(username, 'Username')
  if (!usernameValidation.success) return badRequest(c, usernameValidation.error)
  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  const passwordValidation = validateRequiredString(password, 'Password')
  if (!passwordValidation.success) return badRequest(c, passwordValidation.error)

  const digest = buildSubscriberDigests(username, domain, password)


  try {
    const account = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
    if (!account[0]) return badRequest(c, 'Account ID does not exist')

    const subscriber = await db.insert(subscriberDb).values({
      accountId: accountId,
      extensionId: extensionId,
      defaultDid: defaultDid,
      username: username,
      domain: domain,
      password: password,
      ha1: digest.ha1,
      ha1b: digest.ha1b,
    }).returning()

    return c.json({ subscriber: sanitizeSubscriber(subscriber[0]) }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

subscribersRoute.put('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = await c.req.json()
  const { accountId, extensionId, defaultDid, username, domain, password } = body

  if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
  const extensionValidation = validateRequiredString(extensionId, 'Extension ID')
  if (!extensionValidation.success) return badRequest(c, extensionValidation.error)
  const didValidation = validateRequiredString(defaultDid, 'Default DID')
  if (!didValidation.success) return badRequest(c, didValidation.error)
  const usernameValidation = validateRequiredString(username, 'Username')
  if (!usernameValidation.success) return badRequest(c, usernameValidation.error)
  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)

  try {
    const existingSubscriber = await db.select().from(subscriberDb).where(eq(subscriberDb.id, parsed.id)).limit(1)
    if (!existingSubscriber[0]) return notFound(c, 'Subscriber not found')

    const account = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
    if (!account[0]) return badRequest(c, 'Account ID does not exist')

    const nextPassword = typeof password === 'string' && password ? password : existingSubscriber[0].password
    const digest = buildSubscriberDigests(username, domain, nextPassword)

    const updated = await db.update(subscriberDb).set({
      accountId,
      extensionId,
      defaultDid,
      username,
      domain,
      password: nextPassword,
      ha1: digest.ha1,
      ha1b: digest.ha1b,
    }).where(eq(subscriberDb.id, parsed.id)).returning()

    return c.json({ subscriber: sanitizeSubscriber(updated[0]) })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

subscribersRoute.patch('/:id/password', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = await c.req.json()
  const { password } = body
  const passwordValidation = validateRequiredString(password, 'Password')
  if (!passwordValidation.success) return badRequest(c, passwordValidation.error)

  try {
    const existingSubscriber = await db.select().from(subscriberDb).where(eq(subscriberDb.id, parsed.id)).limit(1)
    if (!existingSubscriber[0]) return notFound(c, 'Subscriber not found')

    const digest = buildSubscriberDigests(existingSubscriber[0].username, existingSubscriber[0].domain, password)

    const updated = await db.update(subscriberDb).set({
      password,
      ha1: digest.ha1,
      ha1b: digest.ha1b,
    }).where(eq(subscriberDb.id, parsed.id)).returning()

    return c.json({ subscriber: sanitizeSubscriber(updated[0]) })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

subscribersRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  try {
    const deleted = await db.delete(subscriberDb).where(eq(subscriberDb.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Subscriber not found')
    return c.json({ subscriber: sanitizeSubscriber(deleted[0]) })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default subscribersRoute

export type Subscriber = InferSelectModel<typeof subscriberDb>
export type NewSubscriber = InferInsertModel<typeof subscriberDb>