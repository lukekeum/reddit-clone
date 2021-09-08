import express, { Express, Request, Response } from 'express'
import { ApolloServer } from 'apollo-server-express'
import http from 'http'
import cors from 'cors'
import compression from 'compression'
import generateSchema from './graphql/schema'

export class Server {
  readonly app: Express

  constructor() {
    this.app = express()

    void this._setupApolloServer()

    this.app.use(cors({ origin: '*', credentials: true }))
    this.app.use(compression({ filter: compressFilter }))
  }

  async _setupApolloServer(): Promise<void> {
    const schema = await generateSchema()
    const server = new ApolloServer({
      schema,
    })
    await server.start()

    server.applyMiddleware({ app: this.app, path: '/graphql' })
  }

  listen(port?: number): http.Server {
    const PORT = port || Number(process.env.PORT) || 3000

    return this.app.listen(PORT)
  }
}

function compressFilter(req: Request, res: Response): boolean {
  if (req.headers['x-no-compression']) return false

  return compression.filter(req, res)
}
