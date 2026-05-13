export type ValidationResult =
  | { success: true }
  | { success: false; error: string }

export const validateRequiredString = (value: unknown, fieldName: string): ValidationResult => {
  if (typeof value !== 'string' || !value.trim()) {
    return { success: false, error: `${fieldName} is required` }
  }
  return { success: true }
}

export const validateOptionalString = (value: unknown, fieldName: string): ValidationResult => {
  if (value === undefined || value === null) {
    return { success: true }
  }
  if (typeof value !== 'string') {
    return { success: false, error: `${fieldName} must be a string` }
  }
  return { success: true }
}

export const validateRequiredNumber = (value: unknown, fieldName: string): ValidationResult => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return { success: false, error: `${fieldName} must be a number` }
  }
  return { success: true }
}

export const validateFlag01 = (value: unknown, fieldName: string): ValidationResult => {
  if (value !== 0 && value !== 1) {
    return { success: false, error: `${fieldName} must be 0 or 1` }
  }
  return { success: true }
}

export const validatePagination = (limit: unknown, offset: unknown): ValidationResult => {
  if (limit !== undefined && (typeof limit !== 'number' || Number.isNaN(limit) || limit <= 0)) {
    return { success: false, error: 'limit must be a positive number' }
  }
  if (offset !== undefined && (typeof offset !== 'number' || Number.isNaN(offset) || offset < 0)) {
    return { success: false, error: 'offset must be a non-negative number' }
  }
  return { success: true }
}