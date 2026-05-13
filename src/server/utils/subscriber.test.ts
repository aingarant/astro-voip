import { describe, expect, it } from 'bun:test'
import { buildSubscriberDigests, sanitizeSubscriber } from './subscriber'

describe('subscriber helpers', () => {
  it('builds deterministic digest values', () => {
    const first = buildSubscriberDigests('1001', 'example.com', 'secret')
    const second = buildSubscriberDigests('1001', 'example.com', 'secret')
    const third = buildSubscriberDigests('1001', 'example.com', 'different')

    expect(first.ha1).toBe(second.ha1)
    expect(first.ha1b).toBe(second.ha1b)
    expect(first.ha1).not.toBe(third.ha1)
  })

  it('removes sensitive properties from responses', () => {
    const safe = sanitizeSubscriber({
      id: 1,
      accountId: 1,
      extensionId: '1001',
      defaultDid: '12025550100',
      username: '1001',
      domain: 'example.com',
      password: 'secret',
      ha1: 'hash1',
      ha1b: 'hash2',
    })

    expect('password' in safe).toBe(false)
    expect('ha1' in safe).toBe(false)
    expect('ha1b' in safe).toBe(false)
    expect(safe.username).toBe('1001')
  })
})
