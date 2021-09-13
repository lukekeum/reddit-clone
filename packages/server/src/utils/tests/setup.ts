import '../env'
import 'reflect-metadata'
import { Database } from '@src/database'
import Container from 'typedi'

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

beforeAll(async () => {
  const database = Container.get(Database)

  await database.connect()
})

afterAll(async () => {
  await Database.close('default')
})
