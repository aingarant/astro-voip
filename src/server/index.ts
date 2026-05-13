import { Hono } from 'hono'
import accountsRoute from './routes/accounts'
import subscribersRoute from './routes/subscribers'
const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/accounts', accountsRoute)
app.route('/subscribers', subscribersRoute)
export default app
