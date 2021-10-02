import { AuthChecker } from 'type-graphql'
import { GraphQLContext } from '@src/graphql/schema'
import { ACCESS_TOKEN_SECRET } from '@src/constant'
import { verify } from 'jsonwebtoken'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '@src/entities/user/UserRepository'

export const customAuthChecker: AuthChecker<GraphQLContext> = async ({
  context,
}) => {
  const token = context.req.cookies['token']
  const userRepository = getCustomRepository(UserRepository)

  if (!token) return false

  try {
    const decoded = verify(token, ACCESS_TOKEN_SECRET) as { userId: string }

    const user = await userRepository.findOneById(decoded.userId)

    if (!user) return false

    context.payload.user = user

    return true
  } catch (error) {
    return false
  }
}
