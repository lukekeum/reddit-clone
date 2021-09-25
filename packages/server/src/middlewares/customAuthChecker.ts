import { AuthChecker } from 'type-graphql'
import { GraphQLContext } from '@src/graphql/schema'
import { ACCESS_TOKEN_SECRET } from '@src/constant'
import { AuthenticationError } from 'apollo-server-errors'
import { verify } from 'jsonwebtoken'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '@src/entities/user/UserRepository'
import { User } from '@src/entities/user/User'

export const customAuthChecker: AuthChecker<GraphQLContext> = async ({
  context,
}) => {
  const token = context.req.cookies['token']
  const userRepository = getCustomRepository(UserRepository)

  if (!token) throw new AuthenticationError('Invalid Token')

  try {
    const decoded = verify(token, ACCESS_TOKEN_SECRET) as { userId: string }

    const user = await userRepository.findOneById(decoded.userId)

    if (!user) throw new AuthenticationError('Invalid Token')

    context.req.user = user

    return true
  } catch (error) {
    throw new AuthenticationError('Invalid Token')
  }
}

declare module 'express' {
  interface Request {
    user?: User
  }
}
