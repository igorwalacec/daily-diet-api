// eslint-disable-next-line
import knex from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      created_at: string
    }

    snacks: {
      id: string
      name: string
      description: string
      date: Date
      isDiet: boolean
      userId: string
    }
  }
}
