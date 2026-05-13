import { Hono } from 'hono'
import { openAPIRouteHandler } from 'hono-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import accountsRoute from './routes/accounts'
import subscribersRoute from './routes/subscribers'
import didsRoute from './routes/dids'
import extensionsRoute from './routes/extensions'
import voicemailRoute from './routes/voicemail'
import registrationsRoute from './routes/registrations'
import dialogsRoute from './routes/dialogs'
import dispatcherRoute from './routes/dispatcher'
import dialplanRoute from './routes/dialplan'
import trustRoute from './routes/trust'
import lcrRoute from './routes/lcr'
import reportsRoute from './routes/reports'
import domainsRoute from './routes/domains'
import dbaliasesRoute from './routes/dbaliases'
import versionRoute from './routes/version'
import ivrRoute from './routes/ivr'
import inboundRoutesRoute from './routes/inbound-routes'
import timeConditionsRoute from './routes/time-conditions'
import routingPoliciesRoute from './routes/routing-policies'
import { db } from './db'
import { sql } from 'drizzle-orm'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.get('/health', (c) => c.json({ status: 'ok' }))
app.get('/ready', async (c) => {
  try {
    await db.execute(sql`select 1`)
    return c.json({ status: 'ready' })
  } catch (error: unknown) {
    return c.json({ status: 'not_ready', error: error instanceof Error ? error.message : 'Unknown error' }, 503)
  }
})

app.route('/accounts', accountsRoute)
app.route('/subscribers', subscribersRoute)
app.route('/dids', didsRoute)
app.route('/extensions', extensionsRoute)
app.route('/', voicemailRoute)
app.route('/registrations', registrationsRoute)
app.route('/dialogs', dialogsRoute)
app.route('/dispatcher', dispatcherRoute)
app.route('/dialplan', dialplanRoute)
app.route('/trust', trustRoute)
app.route('/lcr', lcrRoute)
app.route('/reports', reportsRoute)
app.route('/domains', domainsRoute)
app.route('/dbaliases', dbaliasesRoute)
app.route('/version', versionRoute)
app.route('/ivr', ivrRoute)
app.route('/inbound-routes', inboundRoutesRoute)
app.route('/time-conditions', timeConditionsRoute)
app.route('/routing-policies', routingPoliciesRoute)

app.get('/openapi.json', openAPIRouteHandler(app, {
  documentation: {
    openapi: '3.1.0',
    info: {
      title: 'Astro VoIP Portal API',
      version: '1.0.0',
      description: 'Hono API for VoIP provisioning, operations, and reporting.',
    },
    tags: [
      { name: 'Accounts' },
      { name: 'Subscribers' },
      { name: 'DIDs' },
      { name: 'Extensions' },
      { name: 'Voicemail' },
      { name: 'Operations' },
      { name: 'Reports' },
      { name: 'IVR' },
      { name: 'Routing' },
    ],
  },
}))

app.get('/docs', swaggerUI({ url: '/openapi.json' }))
export default app
