import { FastifyInstance } from 'fastify'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function snacksRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkUserIdExists)

  app.post('/', async (request, reply) => {
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

  app.put('/:id', async (request, reply) => {
    const { userId } = request.cookies

    const getSnackParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getSnackParamsSchema.parse(request.params)
    const updateSnackBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
      date: z.coerce.date(),
    })
    const { name, description, isDiet, date } = updateSnackBodySchema.parse(
      request.body,
    )

    const snack = await knex('snacks')
      .where({
        id,
        userId,
      })
      .first()

    if (!snack) return reply.status(404).send()

    await knex('snacks').update({
      ...snack,
      name,
      description,
      isDiet,
      date,
    })

    return reply.status(204).send()
  })
}
