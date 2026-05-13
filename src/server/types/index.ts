export type Acccount = {
  id: number,
  extAccountId: string
  domain: string
  isActive: number
  createDate: Date
}

export type Subscriber = {
  accountId: number
  extensionId: string
  defaultId: number
  username: string
  domain: string
}

export type Extension = {
  accountId: number
  extensionId: string
  domain: string
  isActive: number
  voicemailEnabled: number
  voicemailId: number
  createDate: Date
}

export type Voicemail = {
  id: number
  accountId: number
  domain: string
  voicemailBoxId: string
  password: string
  email: string
  sendEmail: number
  messageCount: number
  messageCapacity: number
  messageSizeLimit: number
  createDate: Date
}

export type VoicemailMessage = {
  id: number
  accountId: number
  voicemailBoxId: number
  domain: string
  callerId: string
  timestamp: Date
  duration: number
  isNew: number
  filePath: string
}

export type DID = {
  id: number
  did: string
  accountId: number
  domain: string
  isActive: number
  createDate: Date
}

export type Domain = {
  id: number
  accountId: number,
  domain: string
  createDate: Date
}