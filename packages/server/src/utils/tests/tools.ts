import generateSchema from '@src/graphql/schema'
import { ExecutionResult, graphql, GraphQLSchema } from 'graphql'
import { ASTNode, print as gqlToString } from 'graphql/language'
import { Maybe } from 'graphql/jsutils/Maybe'

interface Context {
  req: Record<string, unknown>
  res: Record<string, unknown>
  [key: string]: unknown
}

interface GraphQLCallOptions {
  source: string | ASTNode
  variables?: Maybe<{
    [key: string]: unknown
  }>
  context?: Partial<Context>
}

class GraphQLTesting {
  schema: GraphQLSchema

  constructor() {
    void this.initializeSchema()
  }

  async initializeSchema() {
    this.schema = await generateSchema(true)
  }

  graphQLCall = async <T>({
    source,
    variables,
    context,
  }: GraphQLCallOptions): Promise<ExecutionResult<T>> => {
    if (!this.schema) await this.initializeSchema()

    return graphql({
      schema: this.schema,
      source: typeof source === 'string' ? source : gqlToString(source),
      variableValues: variables,
      contextValue: context,
    }) as ExecutionResult<T>
  }
}
export const graphQLCall = new GraphQLTesting().graphQLCall
