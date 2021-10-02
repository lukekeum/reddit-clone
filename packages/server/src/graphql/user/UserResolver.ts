import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from '@src/constant'
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
import { Response } from 'express'

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

    setUserToken(res, { accessToken, refreshToken })

    return {
      user: payload.user,
      accessToken,
    }
  }

  @Query(() => User, { nullable: true })
  @Authorized()
  me(@Ctx() { payload }: GraphQLContext): User | null {
    return payload.user || null
  }

  @Mutation(() => RefreshTokenResponse, { nullable: true })
  @Authorized()
  async refreshToken(
    @Ctx() { req, res, payload }: GraphQLContext
  ): Promise<RefreshTokenResponse> {
    try {
      const { token, jid } = req.cookies

      const spayload = await this.userService.refreshToken(
        payload.user,
        token,
        jid
      )

      const { accessToken, refreshToken } = spayload.token

      setUserToken(res, { accessToken, refreshToken })

      return {
        ok: true,
      }
    } catch (err) {
      return {
        ok: false,
      }
    }
  }
}

function setUserToken(res: Response, tokens: Record<string, string>): void {
  const cookieOptions: CookieOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }

  res.cookie('token', tokens[0], {
    maxAge: ACCESS_TOKEN_EXPIRES,
    ...cookieOptions,
  })

  res.cookie('jid', tokens[1], {
    maxAge: REFRESH_TOKEN_EXPIRES,
    ...cookieOptions,
  })
}

@ObjectType()
export class RefreshTokenResponse {
  @Field(() => Boolean)
  ok: boolean
}

@ObjectType()
export class TokenResponse {
  @Field(() => User)
  user: User

  @Field()
  accessToken: string
}
