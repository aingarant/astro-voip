import { Hono } from 'hono'
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { db } from '../db'
import { voicemailBoxes, voicemailMessages } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateFlag01, validateRequiredString } from '../utils/validators'

const voicemailRoute = new Hono()

voicemailRoute.get('/voicemail-boxes', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(voicemailBoxes).limit(limit).offset(offset)
    return c.json({ voicemailBoxes: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

voicemailRoute.get('/voicemail-boxes/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(voicemailBoxes).where(eq(voicemailBoxes.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Voicemail box not found')
    return c.json({ voicemailBox: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

voicemailRoute.post('/voicemail-boxes', async (c) => {
  const body = await c.req.json()
  const {
    accountId,
    domain,
    voicemailBoxId,
    password,
    email = '',
    sendEmail = 0,
    messageCapacity = 1000,
    messageSizeLimit = 10240,
  } = body

  if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  const boxValidation = validateRequiredString(voicemailBoxId, 'Voicemail Box ID')
  if (!boxValidation.success) return badRequest(c, boxValidation.error)
  const passwordValidation = validateRequiredString(password, 'Password')
  if (!passwordValidation.success) return badRequest(c, passwordValidation.error)
  const sendEmailValidation = validateFlag01(sendEmail, 'Send Email')
  if (!sendEmailValidation.success) return badRequest(c, sendEmailValidation.error)
  if (typeof messageCapacity !== 'number' || messageCapacity < 0) return badRequest(c, 'messageCapacity must be a non-negative number')
  if (typeof messageSizeLimit !== 'number' || messageSizeLimit <= 0) return badRequest(c, 'messageSizeLimit must be a positive number')

  try {
    const created = await db.insert(voicemailBoxes).values({
      accountId,
      domain,
      voicemailBoxId,
      password,
      email,
      sendEmail,
      messageCapacity,
      messageSizeLimit,
    }).returning()
    return c.json({ voicemailBox: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

voicemailRoute.put('/voicemail-boxes/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = await c.req.json()
  const { accountId, domain, voicemailBoxId, password, email, sendEmail, messageCapacity, messageSizeLimit } = body

  if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  const boxValidation = validateRequiredString(voicemailBoxId, 'Voicemail Box ID')
  if (!boxValidation.success) return badRequest(c, boxValidation.error)
  const passwordValidation = validateRequiredString(password, 'Password')
  if (!passwordValidation.success) return badRequest(c, passwordValidation.error)
  const sendEmailValidation = validateFlag01(sendEmail, 'Send Email')
  if (!sendEmailValidation.success) return badRequest(c, sendEmailValidation.error)
  if (typeof messageCapacity !== 'number' || messageCapacity < 0) return badRequest(c, 'messageCapacity must be a non-negative number')
  if (typeof messageSizeLimit !== 'number' || messageSizeLimit <= 0) return badRequest(c, 'messageSizeLimit must be a positive number')

  try {
    const updated = await db.update(voicemailBoxes).set({
      accountId,
      domain,
      voicemailBoxId,
      password,
      email: typeof email === 'string' ? email : '',
      sendEmail,
      messageCapacity,
      messageSizeLimit,
    }).where(eq(voicemailBoxes.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Voicemail box not found')
    return c.json({ voicemailBox: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

voicemailRoute.delete('/voicemail-boxes/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(voicemailBoxes).where(eq(voicemailBoxes.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Voicemail box not found')
    return c.json({ voicemailBox: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

voicemailRoute.get('/voicemail-messages', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const boxIdParam = c.req.query('voicemailBoxId')
    if (boxIdParam !== undefined) {
      const parsedBoxId = Number.parseInt(boxIdParam, 10)
      if (Number.isNaN(parsedBoxId)) return badRequest(c, 'voicemailBoxId must be a number')
      const rows = await db
        .select()
        .from(voicemailMessages)
        .where(eq(voicemailMessages.voicemailBoxId, parsedBoxId))
        .limit(limit)
        .offset(offset)
      return c.json({ voicemailMessages: rows, page: { limit, offset } })
    }
    const rows = await db.select().from(voicemailMessages).limit(limit).offset(offset)
    return c.json({ voicemailMessages: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

voicemailRoute.get('/voicemail-messages/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(voicemailMessages).where(eq(voicemailMessages.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Voicemail message not found')
    return c.json({ voicemailMessage: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

voicemailRoute.patch('/voicemail-messages/:id/read', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  const body = await c.req.json()
  const { isNew } = body
  const isNewValidation = validateFlag01(isNew, 'isNew')
  if (!isNewValidation.success) return badRequest(c, isNewValidation.error)
  try {
    const updated = await db.update(voicemailMessages).set({ isNew }).where(eq(voicemailMessages.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Voicemail message not found')
    return c.json({ voicemailMessage: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

voicemailRoute.delete('/voicemail-messages/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(voicemailMessages).where(eq(voicemailMessages.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Voicemail message not found')
    return c.json({ voicemailMessage: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default voicemailRoute

export type VoicemailBox = InferSelectModel<typeof voicemailBoxes>
export type NewVoicemailBox = InferInsertModel<typeof voicemailBoxes>
export type VoicemailMessage = InferSelectModel<typeof voicemailMessages>
export type NewVoicemailMessage = InferInsertModel<typeof voicemailMessages>
