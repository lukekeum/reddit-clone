import { User } from '@src/entities/user/User'
import { CookieOptions } from 'express'
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Authorized,
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
    const accessTokenExpires = 1000 * 60 * 15

    const cookieOptions: CookieOptions = {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    }

    res.cookie('token', accessToken, {
      maxAge: accessTokenExpires,
      ...cookieOptions,
    })

    res.cookie('jid', refreshToken, {
      maxAge: refreshTokenExpires,
      ...cookieOptions,
    })

    return {
      user: payload.user,
      accessToken,
    }
  }

  @Query(() => User, { nullable: true })
  @Authorized()
  me(@Ctx() { req }: GraphQLContext): User | null {
    return req.user || null
  }
}

@ObjectType()
export class TokenResponse {
  @Field(() => User)
  user: User

  @Field()
  accessToken: string
}
