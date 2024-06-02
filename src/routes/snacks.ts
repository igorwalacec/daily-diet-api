import { FastifyInstance } from 'fastify'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function snacksRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: checkUserIdExists }, async (request, reply) => {
    const { userId } = request.cookies
    const createSnackBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
      date: z.coerce.date(),
    })

    const { name, description, isDiet, date } = createSnackBodySchema.parse(
      request.body,
    )

    await knex('snacks').insert({
      id: randomUUID(),
      description,
      isDiet,
      name,
      userId,
      date,
    })

    return reply.status(201).send()
  })
}
