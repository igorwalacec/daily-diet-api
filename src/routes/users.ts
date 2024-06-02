import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
    })

    const { name } = createUserSchema.parse(request.body)

    const userId = randomUUID()

    reply.cookie('userId', userId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    await knex('users').insert({
      id: userId,
      name,
    })

    return reply.status(201).send()
  })
}
