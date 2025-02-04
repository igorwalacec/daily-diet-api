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

  app.get('/:id', async (request, reply) => {
    const { userId } = request.cookies

    const getSnackParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getSnackParamsSchema.parse(request.params)

    const snack = await knex('snacks')
      .where({
        id,
        userId,
      })
      .first()

    if (!snack) return reply.status(404).send()

    const formatedSnack = {
      id: snack.id,
      name: snack.name,
      description: snack.description,
      isDiet: !!snack.isDiet,
      date: new Date(snack.date),
    }

    return reply.status(200).send(formatedSnack)
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

  app.get('/metrics', async (request, reply) => {
    const { userId } = request.cookies

    const snacks = await knex('snacks')
      .where({
        userId,
      })
      .orderBy('date', 'desc')
      .select()

    if (!snacks) return reply.status(404).send()

    const totalSnacks = snacks.length
    const totalDietSnacks = snacks.filter((snack) => !!snack.isDiet).length
    const totalNotDietSnacks = snacks.filter((snack) => !snack.isDiet).length
    const { bestOnDietSequence } = snacks.reduce(
      (acc, snack) => {
        if (snack.isDiet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestOnDietSequence) {
          acc.bestOnDietSequence = acc.currentSequence
        }

        return acc
      },
      { bestOnDietSequence: 0, currentSequence: 0 },
    )

    return reply.status(200).send({
      totalSnacks,
      totalDietSnacks,
      totalNotDietSnacks,
      bestOnDietSequence,
    })
  })

  app.delete('/:id', async (request, reply) => {
    const { userId } = request.cookies

    const getSnackParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getSnackParamsSchema.parse(request.params)

    const snack = await knex('snacks')
      .where({
        id,
        userId,
      })
      .first()

    if (!snack) return reply.status(404).send()

    await knex('snacks')
      .where({
        id,
        userId,
      })
      .delete()

    return reply.status(204).send()
  })
}
