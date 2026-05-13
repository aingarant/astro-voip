import { describe, expect, it } from 'bun:test'
import { normalizePagination, parseIdParam } from './http'

describe('http helpers', () => {
  it('parses positive numeric ids', () => {
    expect(parseIdParam('5')).toEqual({ id: 5 })
  })

  it('rejects invalid ids', () => {
    expect(parseIdParam('0')).toEqual({ error: 'ID must be a positive number' })
    expect(parseIdParam('abc')).toEqual({ error: 'ID must be a positive number' })
  })

  it('normalizes pagination with defaults and clamps', () => {
    expect(normalizePagination(undefined, undefined)).toEqual({ limit: 50, offset: 0 })
    expect(normalizePagination('999', '-10')).toEqual({ limit: 500, offset: 0 })
    expect(normalizePagination('5', '2')).toEqual({ limit: 5, offset: 2 })
  })
})
