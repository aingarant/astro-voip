import { describe, expect, it } from 'bun:test'
import app from '../index'

const json = async (response: Response) => response.json() as Promise<{ error?: string }>

describe('route validation checks', () => {
  it('rejects invalid account id params', async () => {
    const response = await app.request('/accounts/abc')
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('ID must be a positive number')
  })

  it('rejects missing subscriber password patch payload', async () => {
    const response = await app.request('/subscribers/1/password', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Password is required')
  })

  it('rejects did create payload when account id is invalid', async () => {
    const response = await app.request('/dids', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ did: '12025550100', accountId: 'x', domain: 'example.com', isActive: 1 }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Account ID is required')
  })

  it('rejects extension voicemail patch with invalid flag', async () => {
    const response = await app.request('/extensions/1/voicemail', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ voicemailEnabled: 2 }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Voicemail Enabled must be 0 or 1')
  })

  it('rejects voicemail message read patch with invalid flag', async () => {
    const response = await app.request('/voicemail-messages/1/read', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ isNew: 7 }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('isNew must be 0 or 1')
  })

  it('keeps voicemail route reachable despite top-level root handler', async () => {
    const response = await app.request('/voicemail-messages/abc')
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('ID must be a positive number')
  })

  it('rejects voicemail messages query with non-numeric voicemailBoxId', async () => {
    const response = await app.request('/voicemail-messages?voicemailBoxId=not-a-number')
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('voicemailBoxId must be a number')
  })

  it('rejects extension create payload with voicemailId when voicemail is disabled', async () => {
    const response = await app.request('/extensions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        accountId: 1,
        extensionId: '1001',
        domain: 'example.com',
        isActive: 1,
        voicemailEnabled: 0,
        voicemailId: 10,
      }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Voicemail ID must be omitted when voicemail is disabled')
  })

  it('rejects extension update payload with voicemailId when voicemail is disabled', async () => {
    const response = await app.request('/extensions/1', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        accountId: 1,
        extensionId: '1001',
        domain: 'example.com',
        isActive: 1,
        voicemailEnabled: 0,
        voicemailId: 10,
      }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Voicemail ID must be omitted when voicemail is disabled')
  })

  it('rejects dispatcher create payload with missing destination', async () => {
    const response = await app.request('/dispatcher', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ setid: 10 }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('destination is required')
  })

  it('rejects dialplan create payload with invalid numeric fields', async () => {
    const response = await app.request('/dialplan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        dpid: 'bad',
        pr: 0,
        matchOp: 0,
        matchExp: '^.+$',
        matchLen: 1,
        substExp: '(.*)',
        replExp: '$1',
        attrs: '',
      }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('dpid, pr, matchOp and matchLen must be numbers')
  })

  it('rejects trusted ACL payload with missing srcIp', async () => {
    const response = await app.request('/trust/trusted', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ proto: 'udp' }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('srcIp is required')
  })

  it('rejects lcr rule target payload with non-numeric IDs', async () => {
    const response = await app.request('/lcr/rule-targets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lcrId: 'x', ruleId: 1, gwId: 1, priority: 1 }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('lcrId, ruleId, gwId, and priority must be numbers')
  })

  it('rejects reports cdr query with invalid duration filter', async () => {
    const response = await app.request('/reports/cdrs?minDuration=NaN')
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('minDuration must be a number')
  })

  it('rejects domain create payload without domain', async () => {
    const response = await app.request('/domains', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ did: 'example.com' }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Domain is required')
  })

  it('rejects dbalias create payload with missing alias username', async () => {
    const response = await app.request('/dbaliases', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ aliasDomain: 'example.com', username: '1001', domain: 'example.com' }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('aliasUsername is required')
  })

  it('rejects ivr profile create payload when account id is invalid', async () => {
    const response = await app.request('/ivr', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accountId: 'x', domain: 'example.com', name: 'Main IVR' }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid input: expected number, received string')
  })

  it('rejects inbound route create payload without did', async () => {
    const response = await app.request('/inbound-routes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        accountId: 1,
        domain: 'example.com',
        targetType: 'ivr',
        targetValue: 'main',
      }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid input: expected string, received undefined')
  })

  it('rejects time condition create payload with empty name', async () => {
    const response = await app.request('/time-conditions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accountId: 1, domain: 'example.com', name: '' }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Name is required')
  })

  it('rejects routing policy create payload with empty domain', async () => {
    const response = await app.request('/routing-policies', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accountId: 1, domain: '', name: 'Default Policy' }),
    })
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Domain is required')
  })

  it('rejects tenant-scoped ivr lookup without tenant query context', async () => {
    const response = await app.request('/ivr/1')
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('accountId query parameter is required')
  })

  it('rejects tenant-scoped routing list without tenant query context', async () => {
    const response = await app.request('/routing-policies')
    const body = await json(response)
    expect(response.status).toBe(400)
    expect(body.error).toBe('accountId query parameter is required')
  })
})
