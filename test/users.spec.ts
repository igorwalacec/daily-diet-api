import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'
import request from 'supertest'

describe('user routes', () => {
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

  it('should be create a new user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'User test',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining('userId')]),
    )
  })
})
