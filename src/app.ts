import fastifyCookie from '@fastify/cookie'
import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import { snacksRoutes } from './routes/snacks'

export const app = fastify()

app.register(fastifyCookie)
app.register(usersRoutes, {
  prefix: 'users',
})
app.register(snacksRoutes, {
  prefix: 'snacks',
})
