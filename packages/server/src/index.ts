import './utils/env'
import 'reflect-metadata'
import { Server } from './server'
import { Database } from './database'

const server = new Server()
const database = new Database()

void database.connect().then(() => {
  server.listen()
})
