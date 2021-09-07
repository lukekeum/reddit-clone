import { buildSchema, Resolver, Query } from 'type-graphql'
import { GraphQLSchema } from 'graphql'

@Resolver()
class DefaultResolver {
  @Query(() => String)
  version() {
    return '1.0'
  }
}

export default async function generateSchema(): Promise<GraphQLSchema> {
  const schema = await buildSchema({
    resolvers: [DefaultResolver],
  })

  return schema
}
