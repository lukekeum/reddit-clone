import { ApolloClient, createHttpLink, from, fromPromise } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { REFRESH_TOKEN } from '../graphql/auth'
import cache from './cache'

const TOKEN_EXPIRED = 'Invalid Token'

const uri = process.env.REACT_APP_APOLLO_URI || 'http://localhost:4000'

const httpLink = createHttpLink({
  uri,
  credentials: 'same-origin',
  headers: () => {
    const token = localStorage.getItem('token')
    return {
      Authorization: `Bearer ${token}`,
    }
  },
})

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (client && graphQLErrors?.[0].message === TOKEN_EXPIRED) {
    const refresh = fromPromise(
      client.mutate({ mutation: REFRESH_TOKEN }).then(({ data }) => {
        return data.RefreshToken.ok
      })
    )

    return refresh.filter((result) => result).flatMap(() => forward(operation))
  }
})

let client = new ApolloClient({
  cache,
  link: from([errorLink, httpLink]),
})

export default client
