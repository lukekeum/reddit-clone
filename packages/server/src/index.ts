import './utils/env'
import 'reflect-metadata'
import { useContainer } from 'typeorm'
import { Container } from 'typeorm-typedi-extensions'
import { Server } from './server'
import { Database } from './database'
import logger from './utils/logger'

useContainer(Container)

const server = new Server()
const database = new Database()

void database
  .connect()
  .then(() => {
    logger.info('Database connected')
    void server.listen().then((server) => {
      const { port } = server.address() as { port: number }
      logger.info(`Server started on port ${port}`)
    })
  })
  .catch((reason) => {
    throw new Error(`Databse Error: ${reason as string}`)
  })
