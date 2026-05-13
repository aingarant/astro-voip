import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const indexSource = readFileSync(resolve(root, 'index.ts'), 'utf8')
const accountsSource = readFileSync(resolve(root, 'routes/accounts.ts'), 'utf8')
const subscribersSource = readFileSync(resolve(root, 'routes/subscribers.ts'), 'utf8')
const didsSource = readFileSync(resolve(root, 'routes/dids.ts'), 'utf8')
const extensionsSource = readFileSync(resolve(root, 'routes/extensions.ts'), 'utf8')
const voicemailSource = readFileSync(resolve(root, 'routes/voicemail.ts'), 'utf8')
const opsSource = readFileSync(resolve(root, 'routes/reports.ts'), 'utf8')

describe('server route contracts', () => {
  it('keeps core provisioning routes mounted', () => {
    expect(indexSource).toContain("app.route('/accounts', accountsRoute)")
    expect(indexSource).toContain("app.route('/subscribers', subscribersRoute)")
    expect(accountsSource).toContain("accountsRoute.patch('/:id/status'")
    expect(subscribersSource).toContain("subscribersRoute.patch('/:id/password'")
  })

  it('mounts new provisioning modules', () => {
    expect(indexSource).toContain("app.route('/dids', didsRoute)")
    expect(indexSource).toContain("app.route('/extensions', extensionsRoute)")
    expect(indexSource).toContain("app.route('/', voicemailRoute)")
    expect(didsSource).toContain("didsRoute.patch('/:id/status'")
    expect(extensionsSource).toContain("extensionsRoute.patch('/:id/voicemail'")
    expect(voicemailSource).toContain("voicemailRoute.patch('/voicemail-messages/:id/read'")
  })

  it('mounts ops and reporting modules', () => {
    expect(indexSource).toContain("app.route('/registrations', registrationsRoute)")
    expect(indexSource).toContain("app.route('/dialogs', dialogsRoute)")
    expect(indexSource).toContain("app.route('/dispatcher', dispatcherRoute)")
    expect(indexSource).toContain("app.route('/dialplan', dialplanRoute)")
    expect(indexSource).toContain("app.route('/trust', trustRoute)")
    expect(indexSource).toContain("app.route('/lcr', lcrRoute)")
    expect(opsSource).toContain("reportsRoute.get('/cdrs'")
    expect(opsSource).toContain("reportsRoute.get('/missed-calls'")
  })
})
