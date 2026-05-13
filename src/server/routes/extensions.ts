import { Hono } from 'hono'
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { db } from '../db'
import { extensions, voicemailBoxes } from '../db/schema'
import { badRequest, internalError, normalizePagination, notFound, parseIdParam } from '../utils/http'
import { validateFlag01, validateRequiredString } from '../utils/validators'

const extensionsRoute = new Hono()

const normalizeVoicemailId = (
  voicemailEnabled: number,
  voicemailId: unknown,
): { value?: number | null; error?: string } => {
  if (voicemailEnabled === 0) {
    if (voicemailId !== undefined && voicemailId !== null) {
      return { error: 'Voicemail ID must be omitted when voicemail is disabled' }
    }
    return { value: null }
  }
  if (voicemailId === undefined || voicemailId === null) {
    return { value: null }
  }
  if (typeof voicemailId !== 'number' || Number.isNaN(voicemailId)) {
    return { error: 'Voicemail ID must be a number' }
  }
  return { value: voicemailId }
}

extensionsRoute.get('/', async (c) => {
  try {
    const { limit, offset } = normalizePagination(c.req.query('limit'), c.req.query('offset'))
    const rows = await db.select().from(extensions).limit(limit).offset(offset)
    return c.json({ extensions: rows, page: { limit, offset } })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

extensionsRoute.get('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const row = await db.select().from(extensions).where(eq(extensions.id, parsed.id)).limit(1)
    if (!row[0]) return notFound(c, 'Extension not found')
    return c.json({ extension: row[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

extensionsRoute.post('/', async (c) => {
  const body = await c.req.json()
  const { accountId, extensionId, domain, isActive = 1, voicemailEnabled = 0, voicemailId } = body

  if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
  const extensionValidation = validateRequiredString(extensionId, 'Extension ID')
  if (!extensionValidation.success) return badRequest(c, extensionValidation.error)
  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  const activeValidation = validateFlag01(isActive, 'Is Active')
  if (!activeValidation.success) return badRequest(c, activeValidation.error)
  const voicemailEnabledValidation = validateFlag01(voicemailEnabled, 'Voicemail Enabled')
  if (!voicemailEnabledValidation.success) return badRequest(c, voicemailEnabledValidation.error)
  const normalizedVoicemail = normalizeVoicemailId(voicemailEnabled, voicemailId)
  if (normalizedVoicemail.error) return badRequest(c, normalizedVoicemail.error)

  try {
    if (normalizedVoicemail.value !== null && normalizedVoicemail.value !== undefined) {
      const box = await db
        .select()
        .from(voicemailBoxes)
        .where(eq(voicemailBoxes.id, normalizedVoicemail.value))
        .limit(1)
      if (!box[0]) return badRequest(c, 'Voicemail box does not exist')
    }

    const created = await db.insert(extensions).values({
      accountId,
      extensionId,
      domain,
      isActive,
      voicemailEnabled,
      voicemailId: normalizedVoicemail.value ?? null,
    }).returning()

    return c.json({ extension: created[0] }, 201)
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

extensionsRoute.put('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = await c.req.json()
  const { accountId, extensionId, domain, isActive, voicemailEnabled, voicemailId } = body

  if (typeof accountId !== 'number' || Number.isNaN(accountId)) return badRequest(c, 'Account ID is required')
  const extensionValidation = validateRequiredString(extensionId, 'Extension ID')
  if (!extensionValidation.success) return badRequest(c, extensionValidation.error)
  const domainValidation = validateRequiredString(domain, 'Domain')
  if (!domainValidation.success) return badRequest(c, domainValidation.error)
  const activeValidation = validateFlag01(isActive, 'Is Active')
  if (!activeValidation.success) return badRequest(c, activeValidation.error)
  const voicemailEnabledValidation = validateFlag01(voicemailEnabled, 'Voicemail Enabled')
  if (!voicemailEnabledValidation.success) return badRequest(c, voicemailEnabledValidation.error)
  const normalizedVoicemail = normalizeVoicemailId(voicemailEnabled, voicemailId)
  if (normalizedVoicemail.error) return badRequest(c, normalizedVoicemail.error)

  try {
    if (normalizedVoicemail.value !== null && normalizedVoicemail.value !== undefined) {
      const box = await db
        .select()
        .from(voicemailBoxes)
        .where(eq(voicemailBoxes.id, normalizedVoicemail.value))
        .limit(1)
      if (!box[0]) return badRequest(c, 'Voicemail box does not exist')
    }

    const updated = await db.update(extensions).set({
      accountId,
      extensionId,
      domain,
      isActive,
      voicemailEnabled,
      voicemailId: normalizedVoicemail.value ?? null,
    }).where(eq(extensions.id, parsed.id)).returning()

    if (!updated[0]) return notFound(c, 'Extension not found')
    return c.json({ extension: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

extensionsRoute.patch('/:id/voicemail', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)

  const body = await c.req.json()
  const { voicemailEnabled, voicemailId } = body
  const voicemailEnabledValidation = validateFlag01(voicemailEnabled, 'Voicemail Enabled')
  if (!voicemailEnabledValidation.success) return badRequest(c, voicemailEnabledValidation.error)

  if (voicemailId !== undefined && voicemailId !== null) {
    if (typeof voicemailId !== 'number' || Number.isNaN(voicemailId)) return badRequest(c, 'Voicemail ID must be a number')
    const box = await db.select().from(voicemailBoxes).where(eq(voicemailBoxes.id, voicemailId)).limit(1)
    if (!box[0]) return badRequest(c, 'Voicemail box does not exist')
  }

  try {
    const updated = await db.update(extensions).set({
      voicemailEnabled,
      voicemailId: voicemailEnabled === 1 ? (voicemailId ?? null) : null,
    }).where(eq(extensions.id, parsed.id)).returning()
    if (!updated[0]) return notFound(c, 'Extension not found')
    return c.json({ extension: updated[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

extensionsRoute.delete('/:id', async (c) => {
  const parsed = parseIdParam(c.req.param('id'))
  if ('error' in parsed) return badRequest(c, parsed.error)
  try {
    const deleted = await db.delete(extensions).where(eq(extensions.id, parsed.id)).returning()
    if (!deleted[0]) return notFound(c, 'Extension not found')
    return c.json({ extension: deleted[0] })
  } catch (error: unknown) {
    console.error(error)
    return internalError(c, error)
  }
})

export default extensionsRoute

export type Extension = InferSelectModel<typeof extensions>
export type NewExtension = InferInsertModel<typeof extensions>
