import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'child_process'

describe('snack routes', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be identify user', async () => {
    await request(app.server)
      .post('/snacks')
      .send({
        name: 'Hamburguer',
        description: 'Rocket Burguer',
        isDiet: false,
      })
      .expect(401)
  })

  it('should be able to create a new snack', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Igor' })
      .expect(201)

    await request(app.server)
      .post('/snacks')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .send({
        name: 'Hambuguer',
        description: 'Rocket Burguer',
        isDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  it('should be list all snacks specific user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Igor' })
      .expect(201)

    const date = new Date()

    await request(app.server)
      .post('/snacks')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .send({
        name: 'Hambuguer',
        description: 'Rocket Burguer',
        isDiet: true,
        date,
      })

    const userSnacks = await request(app.server)
      .get('/snacks')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)

    expect(userSnacks.body.snacks).toHaveLength(1)
    expect(userSnacks.body.snacks[0].name).toBe('Hambuguer')
    expect(userSnacks.body.snacks[0].description).toBe('Rocket Burguer')
    expect(userSnacks.body.snacks[0].isDiet).toBe(true)
    expect(new Date(userSnacks.body.snacks[0].date)).toStrictEqual(date)
  })

  it('should be get specific snack', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Igor' })
      .expect(201)

    const date = new Date()

    await request(app.server)
      .post('/snacks')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .send({
        name: 'Hambuguer',
        description: 'Rocket Burguer',
        isDiet: true,
        date,
      })

    const userSnacks = await request(app.server)
      .get('/snacks/')
      .set('Cookie', userResponse.get('Set-Cookie')!)

    const snack = await request(app.server)
      .get(`/snacks/${userSnacks.body.snacks[0].id}`)
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)

    expect(snack.body.name).toBe('Hambuguer')
    expect(snack.body.description).toBe('Rocket Burguer')
    expect(snack.body.isDiet).toBe(true)
    expect(new Date(snack.body.date)).toStrictEqual(date)
  })

  it('should be update data', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Igor' })
      .expect(201)

    await request(app.server)
      .post('/snacks')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .send({
        name: 'Hambuguer',
        description: 'Rocket Burguer',
        isDiet: true,
        date: new Date(),
      })

    const userSnacks = await request(app.server)
      .get('/snacks/')
      .set('Cookie', userResponse.get('Set-Cookie')!)

    await request(app.server)
      .put(`/snacks/${userSnacks.body.snacks[0].id}`)
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .send({
        name: 'Pizza',
        description: 'Pepperoni',
        isDiet: false,
        date: new Date(),
      })
      .expect(204)
  })

  it('should be delete snack', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Igor' })
      .expect(201)

    await request(app.server)
      .post('/snacks')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .send({
        name: 'Hambuguer',
        description: 'Rocket Burguer',
        isDiet: true,
        date: new Date(),
      })

    const userSnacks = await request(app.server)
      .get('/snacks/')
      .set('Cookie', userResponse.get('Set-Cookie')!)

    await request(app.server)
      .delete(`/snacks/${userSnacks.body.snacks[0].id}`)
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(204)
  })

  it('should be get metrics', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Igor' })
      .expect(201)

    await request(app.server)
      .post('/snacks')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .send({
        name: 'Hambuguer',
        description: 'Rocket Burguer',
        isDiet: true,
        date: new Date(),
      })

    await request(app.server)
      .post('/snacks')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .send({
        name: 'Pizza',
        description: 'Pepperoni',
        isDiet: false,
        date: new Date(),
      })

    const metrics = await request(app.server)
      .get('/snacks/metrics')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)

    expect(metrics.body.totalSnacks).toBe(2)
    expect(metrics.body.totalDietSnacks).toBe(1)
    expect(metrics.body.totalNotDietSnacks).toBe(1)
    expect(metrics.body.bestOnDietSequence).toBe(1)
  })
})
