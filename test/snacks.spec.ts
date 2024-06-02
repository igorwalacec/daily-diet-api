import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
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

  it.todo('should be update data', async () => {
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
  })
})
