/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import generateSchema from '@src/graphql/schema'
import { graphql, GraphQLSchema } from 'graphql'
import { ASTNode, print as gqlToString } from 'graphql/language'
import { Maybe } from 'graphql/jsutils/Maybe'

interface GraphQLCallOptions {
  source: string | ASTNode
  variables?: Maybe<{
    [key: string]: unknown
  }>
}

class GraphQLTesting {
  schema: GraphQLSchema

  constructor() {
    void this.initializeSchema()
  }

  async initializeSchema() {
    this.schema = await generateSchema()
  }

  async graphQLCall({ source, variables }: GraphQLCallOptions) {
    if (!this.schema) await this.initializeSchema()

    return graphql({
      schema: this.schema,
      source: typeof source === 'string' ? source : gqlToString(source),
      variableValues: variables,
    })
  }
}

export const graphQLCall = new GraphQLTesting().graphQLCall
