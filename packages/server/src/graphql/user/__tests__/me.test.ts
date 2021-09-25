/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { User } from '@src/entities/user/User'
import { UserRepository } from '@src/entities/user/UserRepository'
import { getCustomRepository } from 'typeorm'
import { gql } from 'apollo-server-core'
import { graphQLCall } from '@src/utils/tests/tools'
import faker from 'faker'

interface MeResponse {
  me: User | null
}

describe('me', () => {
  const ME_QUERY = gql`
    query {
      me {
        id
        email
        username
        createdAt
        updatedAt
      }
    }
  `

  let user: User

  beforeEach(async () => {
    const userRepository = getCustomRepository(UserRepository)

    const userData = {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
    }

    user = await userRepository.create(userData).save()
  })

  afterEach(async () => {
    const userRepository = getCustomRepository(UserRepository)

    await userRepository.delete(user)
  })

  it('헤더 토큰이 없을 때', async () => {
    const response = await graphQLCall<MeResponse>({ source: ME_QUERY })

    expect(response.data!.me).toBeNull()
  })

  it('잘못된 헤더 토큰', async () => {
    const response = await graphQLCall<MeResponse>({
      source: ME_QUERY,
      context: {
        req: { cookies: { token: 'wrong token' } },
      },
    })

    expect(response.data!.me).toBeNull()
    expect(response.errors).toHaveLength(1)
    expect(response.errors![0].message).toBe('Invalid Token')
  })

  it('올바른 헤더 토큰', async () => {
    const userRepository = getCustomRepository(UserRepository)

    const tokens = await userRepository.generateToken(user)
    const accessToken = tokens[1]

    const response = await graphQLCall<MeResponse>({
      source: ME_QUERY,
      context: {
        req: { cookies: { token: accessToken } },
      },
    })

    expect(response.data!.me).toBeDefined()

    const usr = response.data!.me || new User({}) // response.data.me의 값의 존재가 확실함

    const userFromDB = await userRepository.findOneById(usr.id)

    expect(userFromDB).toEqual(user)
  })
})
