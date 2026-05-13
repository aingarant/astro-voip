import { Hono } from 'hono'
import { db } from '../db'
import { subscriber as subscriberDb } from '../db/schema'
import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import crypto from 'crypto'
const subscribersRoute = new Hono()

subscribersRoute.get('/', async (c) => {
  const subscribersData = await db.select().from(subscriberDb)
  return c.json({ subscribers: subscribersData })
})

// Create New Subscriber
subscribersRoute.post('/', async (c) => {
  const body = await c.req.json()

  const { accountId, extensionId, defaultDid, username, domain, password } = body

  if (!accountId)
    return c.json({ error: 'Account ID is required' }, 400)
  if (!extensionId)
    return c.json({ error: 'Extension ID is required' }, 400)
  if (!defaultDid)
    return c.json({ error: 'Default DID is required' }, 400)
  if (!username)
    return c.json({ error: 'Username is required' }, 400)
  if (!domain)
    return c.json({ error: 'Domain is required' }, 400)
  if (!password)
    return c.json({ error: 'Password is required' }, 400)

  // encryp the password for Kamailio
  const ha1 = crypto.createHash('md5').update(password).digest('hex')
  const ha1b = crypto.createHash('md5').update(`${username}:${domain}`).digest('hex')


  try {
    const subscriber = await db.insert(subscriberDb).values({
      accountId: accountId,
      extensionId: extensionId,
      defaultDid: defaultDid,
      username: username,
      domain: domain,
      password: password,
      ha1: ha1,
      ha1b: ha1b,
    }).returning()

    return c.json({ subscriber: subscriber[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return c.json({ error: error instanceof Error ? error.message : (error as Error)?.message || 'Unknown error' }, 500)
  }
})

export default subscribersRoute

export type Subscriber = InferSelectModel<typeof subscriberDb>
export type NewSubscriber = InferInsertModel<typeof subscriberDb>