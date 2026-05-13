import { describe, expect, it } from 'bun:test'
import app from '../index'

describe('openapi docs endpoints', () => {
  it('serves OpenAPI spec JSON', async () => {
    const response = await app.request('/openapi.json')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')

    const body = await response.json() as { openapi?: string; info?: { title?: string } }
    expect(body.openapi).toBeDefined()
    expect(body.info?.title).toBe('Astro VoIP Portal API')
  })

  it('documents account and subscriber operations', async () => {
    const response = await app.request('/openapi.json')
    const body = await response.json() as {
      paths?: Record<string, { get?: { summary?: string }; post?: { summary?: string } }>
    }

    expect(body.paths?.['/accounts']?.get?.summary).toBe('List accounts')
    expect(body.paths?.['/accounts']?.post?.summary).toBe('Create account')
    expect(body.paths?.['/subscribers']?.get?.summary).toBe('List subscribers')
    expect(body.paths?.['/subscribers']?.post?.summary).toBe('Create subscriber')
  })

  it('documents ivr and routing operations', async () => {
    const response = await app.request('/openapi.json')
    const body = await response.json() as {
      paths?: Record<string, { get?: { summary?: string }; post?: { summary?: string } }>
    }

    expect(body.paths?.['/ivr']?.get?.summary).toBe('List IVR profiles')
    expect(body.paths?.['/ivr']?.post?.summary).toBe('Create IVR profile')
    expect(body.paths?.['/inbound-routes']?.get?.summary).toBe('List inbound routes')
    expect(body.paths?.['/time-conditions']?.post?.summary).toBe('Create time condition')
    expect(body.paths?.['/routing-policies']?.post?.summary).toBe('Create routing policy')
  })

  it('serves Swagger UI page', async () => {
    const response = await app.request('/docs')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')

    const html = await response.text()
    expect(html).toContain('/openapi.json')
    expect(html.toLowerCase()).toContain('swagger')
  })

  it('serves basic liveness probe', async () => {
    const response = await app.request('/health')
    expect(response.status).toBe(200)
    const body = await response.json() as { status?: string }
    expect(body.status).toBe('ok')
  })
})
