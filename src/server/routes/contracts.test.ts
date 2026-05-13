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
const domainsSource = readFileSync(resolve(root, 'routes/domains.ts'), 'utf8')
const dbaliasesSource = readFileSync(resolve(root, 'routes/dbaliases.ts'), 'utf8')
const ivrSource = readFileSync(resolve(root, 'routes/ivr.ts'), 'utf8')
const inboundRoutesSource = readFileSync(resolve(root, 'routes/inbound-routes.ts'), 'utf8')
const timeConditionsSource = readFileSync(resolve(root, 'routes/time-conditions.ts'), 'utf8')
const routingPoliciesSource = readFileSync(resolve(root, 'routes/routing-policies.ts'), 'utf8')

describe('server route contracts', () => {
  it('keeps core provisioning routes mounted', () => {
    expect(indexSource).toContain("app.route('/accounts', accountsRoute)")
    expect(indexSource).toContain("app.route('/subscribers', subscribersRoute)")
    expect(accountsSource).toContain('accountsRoute.patch(')
    expect(accountsSource).toContain("'/:id/status'")
    expect(subscribersSource).toContain('subscribersRoute.patch(')
    expect(subscribersSource).toContain("'/:id/password'")
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

  it('mounts setup-completion modules and probes', () => {
    expect(indexSource).toContain("app.get('/health'")
    expect(indexSource).toContain("app.get('/ready'")
    expect(indexSource).toContain("app.route('/domains', domainsRoute)")
    expect(indexSource).toContain("app.route('/dbaliases', dbaliasesRoute)")
    expect(indexSource).toContain("app.route('/version', versionRoute)")
    expect(domainsSource).toContain("domainsRoute.get('/:id/attrs'")
    expect(dbaliasesSource).toContain("dbaliasesRoute.post(")
  })

  it('mounts ivr and tenant routing modules', () => {
    expect(indexSource).toContain("app.route('/ivr', ivrRoute)")
    expect(indexSource).toContain("app.route('/inbound-routes', inboundRoutesRoute)")
    expect(indexSource).toContain("app.route('/time-conditions', timeConditionsRoute)")
    expect(indexSource).toContain("app.route('/routing-policies', routingPoliciesRoute)")
    expect(ivrSource).toContain("ivrRoute.patch('/:id/status'")
    expect(inboundRoutesSource).toContain("inboundRoutesRoute.post(")
    expect(timeConditionsSource).toContain("timeConditionsRoute.post(")
    expect(routingPoliciesSource).toContain("routingPoliciesRoute.post(")
  })

  it('enforces tenant-scoped uniqueness checks in new modules', () => {
    expect(ivrSource).toContain('eq(ivrProfiles.accountId, accountId)')
    expect(ivrSource).toContain('eq(ivrProfiles.domain, domain)')
    expect(timeConditionsSource).toContain('eq(timeConditions.accountId, accountId)')
    expect(timeConditionsSource).toContain('eq(timeConditions.domain, domain)')
    expect(routingPoliciesSource).toContain('eq(routingPolicies.accountId, accountId)')
    expect(routingPoliciesSource).toContain('eq(routingPolicies.domain, domain)')
    expect(inboundRoutesSource).toContain('eq(inboundRoutes.accountId, accountId)')
    expect(inboundRoutesSource).toContain('eq(inboundRoutes.domain, domain)')
    expect(inboundRoutesSource).toContain('eq(inboundRoutes.did, did)')
  })
})
