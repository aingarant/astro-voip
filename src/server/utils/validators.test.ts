import { describe, expect, it } from 'bun:test'
import { validateFlag01, validateRequiredNumber, validateRequiredString } from './validators'

describe('validators', () => {
  it('validates required strings', () => {
    expect(validateRequiredString('abc', 'Field')).toEqual({ success: true })
    expect(validateRequiredString('', 'Field')).toEqual({ success: false, error: 'Field is required' })
  })

  it('validates required numbers', () => {
    expect(validateRequiredNumber(1, 'Field')).toEqual({ success: true })
    expect(validateRequiredNumber('1', 'Field')).toEqual({ success: false, error: 'Field must be a number' })
  })

  it('validates 0/1 flags', () => {
    expect(validateFlag01(0, 'Is Active')).toEqual({ success: true })
    expect(validateFlag01(1, 'Is Active')).toEqual({ success: true })
    expect(validateFlag01(2, 'Is Active')).toEqual({ success: false, error: 'Is Active must be 0 or 1' })
  })
})
