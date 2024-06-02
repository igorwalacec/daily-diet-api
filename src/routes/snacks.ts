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
      isDiet: z.coerce.boolean(),
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
      isDiet: z.coerce.boolean(),
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

  app.get('/', async (request, reply) => {
    const { userId } = request.cookies

    const snacks = await knex('snacks')
      .where({
        userId,
      })
      .orderBy('date', 'desc')
      .select()

    if (!snacks) return reply.status(404).send()

    const formatResponse = snacks.map((item) => {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        isDiet: !!item.isDiet,
        date: new Date(item.date),
      }
    })

    return reply.status(200).send({ snacks: formatResponse })
  })
}
