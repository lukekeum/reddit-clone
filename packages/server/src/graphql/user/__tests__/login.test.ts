/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { User } from '@src/entities/user/User'
import { gql } from 'apollo-server-core'
import faker from 'faker'
import { UserRepository } from '@src/entities/user/UserRepository'
import { getCustomRepository } from 'typeorm'
import { graphQLCall } from '@src/utils/tests/tools'
import { v4 as uuidv4 } from 'uuid'
import { TokenResponse } from '../UserResolver'
import { isJWT } from 'class-validator'
import { verify } from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET } from '@src/constant'

describe('로그인', () => {
  const LOGIN_USER = gql`
    mutation ($username: String!, $password: String!) {
      login(input: { username: $username, password: $password }) {
        user_id
        accessToken
      }
    }
  `

  let mockUser: User
  let userData: Partial<User>

  beforeEach(async () => {
    const userRepository = getCustomRepository(UserRepository)

    userData = {
      id: uuidv4(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
    }

    mockUser = await userRepository.create(userData).save()
  })

  it('올바르지 않은 유저이름 값', async () => {
    const user = await graphQLCall({
      source: LOGIN_USER,
      variables: { username: 'wrong', password: mockUser.password },
    })

    expect(user.errors).toBeDefined()
  })

  it('올바르지 않은 비밀번호', async () => {
    const user = await graphQLCall({
      source: LOGIN_USER,
      variables: { username: mockUser.username, password: 'wrong' },
    })

    expect(user.errors).toBeDefined()
  })

  it('올바르지 않은 유저이름 값과 비밀번호', async () => {
    const user = await graphQLCall({
      source: LOGIN_USER,
      variables: { username: 'wrong', password: 'wrong' },
    })

    expect(user.errors).toBeDefined()
  })

  it('유저 로그인', async () => {
    const user = mockUser

    const response = await graphQLCall<{ login: TokenResponse }>({
      source: LOGIN_USER,
      variables: { username: user.username, password: userData.password },
      context: {
        res: {
          cookie: jest.fn(),
        },
      },
    })

    expect(response.data).toBeDefined()

    const { accessToken, user_id } = response.data!.login

    expect(response.data).toBeDefined()
    expect(isJWT(accessToken)).toBe(true)
    expect(user_id).toBe(mockUser.id)

    const payload = verify(accessToken, ACCESS_TOKEN_SECRET) as {
      userId: string
    }

    expect(payload.userId).toBe(mockUser.id)
  })
})
