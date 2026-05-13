export const validateAccount = (account: Account) => {
  if (!account.extAccountId) {
    return { error: 'Exteernal Account ID is required' }
  }
  if (!account.domain) {
    return { error: 'Domain is required' }
  }
  return { success: true }
}

export const validateSubscriber = (subscriber: Subscriber) => {
  if (!subscriber.accountId) {
    return { error: 'Account ID is required' }
  }
  if (!subscriber.extensionId) {
    return { error: 'Extension ID is required' }
  }
  return { success: true }
}

export const validateExtension = (extension: Extension) => {
  if (!extension.accountId) {
    return { error: 'Account ID is required' }
  }
  if (!extension.extensionId) {
    return { error: 'Extension ID is required' }
  }
  return { success: true }
}