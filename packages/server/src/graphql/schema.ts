import { buildSchema, Resolver, Query, ResolverData } from 'type-graphql'
import { GraphQLSchema } from 'graphql'
import { UserResolver } from './user/UserResolver'
import Container from 'typedi'
import { Request, Response } from 'express'

export interface GraphQLContext {
  req: Request
  res: Response
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
    container: ({ context }: ResolverData<GraphQLContext>) =>
      test ? Container : Container.of(context.requestId),
  })

  return schema
}
