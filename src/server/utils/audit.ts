import type { Context } from 'hono'
import { db } from '../db'
import { tenantAuditLog } from '../db/schema'

type AuditPayload = {
  accountId: number
  domain: string
  entityType: string
  entityId: number
  action: string
  beforePayload?: unknown
  afterPayload?: unknown
}

export const writeTenantAuditLog = async (c: Context, payload: AuditPayload) => {
  const actor = c.req.header('x-actor') ?? 'system'
  const requestId = c.req.header('x-request-id') ?? ''

  await db.insert(tenantAuditLog).values({
    accountId: payload.accountId,
    domain: payload.domain,
    entityType: payload.entityType,
    entityId: payload.entityId,
    action: payload.action,
    actor,
    requestId,
    beforePayload: payload.beforePayload === undefined ? null : JSON.stringify(payload.beforePayload),
    afterPayload: payload.afterPayload === undefined ? null : JSON.stringify(payload.afterPayload),
  })
}

