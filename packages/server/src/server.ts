/* eslint-disable @typescript-eslint/require-await */
import express, { Express, Request, Response } from 'express'
import { ApolloServer } from 'apollo-server-express'
import http from 'http'
import cors from 'cors'
import compression from 'compression'
import generateSchema, { GraphQLContext } from './graphql/schema'
import Container from 'typedi'
import cookieParser from 'cookie-parser'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'

export class Server {
  readonly app: Express
  server: ApolloServer

  constructor() {
    this.app = express()

    void this.setupApolloServer().then(() => {
      void this.server.start().then(() => {
        this.server.applyMiddleware({ app: this.app, path: '/graphql' })
      })
    })

    this.app.use(cors({ origin: '*', credentials: true }))
    this.app.use(compression({ filter: compressFilter }))
    this.app.use(cookieParser())
  }

  async setupApolloServer(): Promise<ApolloServer> {
    const schema = await generateSchema()

    this.server = new ApolloServer({
      schema,
      formatError: (err) => {
        if (err.message.startsWith('Database Error: ')) {
          return new Error('Internal server error')
        }

        return err
      },
      context: ({ req, res }) => {
        const requestId = `${Math.floor(
          Math.random() * Number.MAX_SAFE_INTEGER
        )}`
        const container = Container.of(`${requestId}`)
        const payload = { user: undefined }
        const context: GraphQLContext = {
          requestId,
          payload,
          req,
          res,
          container,
        }
        container.set('context', context)
        return context
      },
      plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground(),
        {
          async requestDidStart() {
            return {
              async willSendResponse(requestContext) {
                Container.reset(requestContext.context.requestId)
              },
            }
          },
        },
      ],
    })

    return this.server
  }

  listen(port?: number): Promise<http.Server> {
    const PORT = port || Number(process.env.PORT) || 3000

    return new Promise((res) => {
      res(this.app.listen(PORT))
    })
  }
}

function compressFilter(req: Request, res: Response): boolean {
  if (req.headers['x-no-compression']) return false

  return compression.filter(req, res)
}
