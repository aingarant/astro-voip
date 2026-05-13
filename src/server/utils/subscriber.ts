import crypto from 'crypto'

type SubscriberLike = {
  id: number
  accountId: number
  extensionId: string | null
  defaultDid: string | null
  username: string
  domain: string
  password: string
  ha1: string
  ha1b: string
}

export const buildSubscriberDigests = (username: string, domain: string, password: string) => {
  const ha1 = crypto.createHash('md5').update(password).digest('hex')
  const ha1b = crypto.createHash('md5').update(`${username}:${domain}`).digest('hex')
  return { ha1, ha1b }
}

export const sanitizeSubscriber = (subscriber: SubscriberLike) => {
  const { password: _password, ha1: _ha1, ha1b: _ha1b, ...safeSubscriber } = subscriber
  return safeSubscriber
}
