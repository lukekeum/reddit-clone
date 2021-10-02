import { buildSchema, Resolver, Query, ResolverData } from 'type-graphql'
import { GraphQLSchema } from 'graphql'
import { UserResolver } from './user/UserResolver'
import Container from 'typedi'
import { Request, Response } from 'express'
import { customAuthChecker } from '@src/middlewares/customAuthChecker'
import { User } from '@src/entities/user/User'

export interface ContextPayload {
  user?: User
}

export interface GraphQLContext {
  req: Request
  res: Response
  payload: ContextPayload
  requestId: string
  container: Container
}

@Resolver()
class DefaultResolver {
  @Query(() => String)
  version() {
    return '1.0'
  }
}

export default async function generateSchema(
  test = false
): Promise<GraphQLSchema> {
  const schema = await buildSchema({
    resolvers: [DefaultResolver, UserResolver],
    validate: false,
    dateScalarMode: 'isoDate',
    container: ({ context }: ResolverData<GraphQLContext>) =>
      test ? Container : Container.of(context.requestId),
    authChecker: customAuthChecker,
  })

  return schema
}
