import { Hono } from 'hono'
import { db } from '../db'
import { accounts as accountsDb } from '../db/schema'
import { eq, InferInsertModel, InferSelectModel } from 'drizzle-orm'
const accountsRoute = new Hono()

accountsRoute.get('/', async (c) => {
  const accountsData = await db.select().from(accountsDb)
  return c.json({ accounts: accountsData })
})

// Create New Account
accountsRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { extAccountId, domain } = body

  try {
    const account = await db.insert(accountsDb).values({
      extAccountId: extAccountId,
      domain: domain,
      isActive: 1
    }).returning()

    return c.json({ account: account[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return c.json({ error: error instanceof Error ? error.message : (error as Error)?.message || 'Unknown error' }, 500)
  }
})

// update an account
accountsRoute.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const { extAccountId, domain, isActive } = body

  if (!extAccountId)
    return c.json({ error: 'External Account ID is required' }, 400)
  if (!domain)
    return c.json({ error: 'Domain is required' }, 400)
  if (isActive === undefined)
    return c.json({ error: 'Is Active is required' }, 400)
  if (typeof isActive !== 'number')
    return c.json({ error: 'Is Active must be a number' }, 400)
  if (isActive !== 0 && isActive !== 1)
    return c.json({ error: 'Is Active must be 0 or 1' }, 400)
  if (isNaN(id))
    return c.json({ error: 'ID must be a number' }, 400)
  if (id <= 0)
    return c.json({ error: 'ID must be greater than 0' }, 400)
  try {
    const account = await db.update(accountsDb).set({
      extAccountId: extAccountId,
      domain: domain,
      isActive: isActive,
    }).where(eq(accountsDb.id, id)).returning()
    return c.json({ account: account[0] }, 200)
  } catch (error: unknown) {
    console.error(error)
    return c.json({ error: error instanceof Error ? error.message : (error as Error)?.message || 'Unknown error' }, 500)
  }
})

export default accountsRoute

export type Account = InferSelectModel<typeof accountsDb>
export type NewAccount = InferInsertModel<typeof accountsDb>