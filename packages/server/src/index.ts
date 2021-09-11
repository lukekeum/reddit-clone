import './utils/env'
import 'reflect-metadata'
import { Server } from './server'
import { Database } from './database'
import { Container } from 'typedi'
import logger from './utils/logger'

const server = Container.get(Server)
const database = Container.get(Database)

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
