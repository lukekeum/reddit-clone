import '../env'
import 'reflect-metadata'
import { Database } from '@src/database'
import { useContainer } from 'typeorm'
import { Container } from 'typeorm-typedi-extensions'

const database = new Database()

useContainer(Container)

beforeAll(async () => {
  await database.connect()
})

afterAll(async () => {
  await Database.close('default')
})
