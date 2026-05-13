import { Hono } from 'hono'
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

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
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
export default app
