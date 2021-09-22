/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UserRepository } from '@src/entities/user/UserRepository'
import { graphQLCall } from '@src/utils/tests/tools'
import { gql } from 'apollo-server-core'
import { getCustomRepository } from 'typeorm'
import faker from 'faker'

interface RegisterMutationData {
  register: boolean
}

describe('회원가입', () => {
  const REGISTER_USER = gql`
    mutation ($email: String!, $username: String!, $password: String!) {
      register(
        input: { email: $email, username: $username, password: $password }
      )
    }
  `

  it('올바르지 않은 이메일 값', async () => {
    const email = 'wrong' // 올바르지 않은 이메일 형식
    const username = faker.internet.userName()
    const password = faker.internet.password()

    const response = await graphQLCall({
      source: REGISTER_USER,
      variables: { email, username, password },
    })

    expect(response.data).toBe(null)
    expect(response.errors).toBeDefined()
  })

  it('이미 존재하는 유자', async () => {
    const userRepository = getCustomRepository(UserRepository)

    const email = faker.internet.email()
    const username = faker.internet.userName()
    const password = faker.internet.password()

    const user = userRepository.create({
      email,
      username,
      password,
    })

    await user.save()

    const response = await graphQLCall({
      source: REGISTER_USER,
      variables: { email, username, password },
    })

    expect(response.data).toBe(null)
    expect(response.errors).toBeDefined()
  })

  it('유저 회원가입', async () => {
    const userRepository = getCustomRepository(UserRepository)

    const email = faker.internet.email()
    const username = faker.internet.userName()
    const password = faker.internet.password()

    const user = await userRepository.create({
      email,
      username,
      password,
    })

    const response = await graphQLCall<RegisterMutationData>({
      source: REGISTER_USER,
      variables: { email, username, password },
      context: {
        res: {},
      },
    })

    expect(response.data!.register).toBe(true)

    const userFromDB = await userRepository.findOneByEmail(email)

    expect(userFromDB).toBeDefined()
    expect(userFromDB?.email === user.email).toBe(true)
    expect(userFromDB?.username === user.username).toBe(true)
  })
})
