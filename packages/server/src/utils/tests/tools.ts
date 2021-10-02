import generateSchema, { GraphQLContext } from '@src/graphql/schema'
import { ExecutionResult, graphql, GraphQLSchema } from 'graphql'
import { ASTNode, print as gqlToString } from 'graphql/language'
import { Maybe } from 'graphql/jsutils/Maybe'

type DeepPartial<T> = { [P in keyof T]?: Partial<T[P]> }

interface GraphQLCallOptions {
  source: string | ASTNode
  variables?: Maybe<{
    [key: string]: unknown
  }>
  context?: DeepPartial<GraphQLContext>
}

const defaultContext = (): Partial<GraphQLContext> => ({
  payload: {
    user: undefined,
  },
  requestId: `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
})

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

    const ctx: DeepPartial<GraphQLContext> = {
      ...context,
      ...defaultContext(),
    }

    return graphql({
      schema: this.schema,
      source: typeof source === 'string' ? source : gqlToString(source),
      variableValues: variables,
      contextValue: ctx,
    }) as ExecutionResult<T>
  }
}
export const graphQLCall = new GraphQLTesting().graphQLCall
