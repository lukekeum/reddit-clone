import { User } from '@src/entities/user/User'
import { CookieOptions } from 'express'
import {
  Arg,
  Ctx,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql'
import { Inject, Service } from 'typedi'
import { GraphQLContext } from '../schema'
import { LoginInput, RegisterInput } from './UserInput'
import UserService from './UserService'

@Service()
@Resolver(() => User)
export class UserResolver {
  @Inject()
  private readonly userService: UserService

  @Mutation(() => Boolean)
  async register(@Arg('input') registerInput: RegisterInput): Promise<boolean> {
    const { email, username, password } = registerInput

    await this.userService.register(email, username, password)

    return true
  }

  @Mutation(() => TokenResponse)
  async login(
    @Arg('input') loginInput: LoginInput,
    @Ctx() { res }: GraphQLContext
  ): Promise<TokenResponse> {
    const { username, password } = loginInput

    const payload = await this.userService.login(username, password)

    const { accessToken, refreshToken } = payload.token

    const refreshTokenExpires = 1000 * 60 * 60 * 24 * 7

    const cookieOptions: CookieOptions = {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    }

    res.cookie('jid', refreshToken, {
      maxAge: refreshTokenExpires,
      ...cookieOptions,
    })

    return {
      user_id: payload.user.id,
      accessToken,
    }
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: GraphQLContext): Promise<User | null> {
    const authorization = req.headers['authorization']

    if (!authorization) return null

    const token = authorization.split(' ')[1]

    return this.userService.me(token)
  }
}

@ObjectType()
export class TokenResponse {
  @Field(() => ID)
  user_id: string

  @Field()
  accessToken: string
}
