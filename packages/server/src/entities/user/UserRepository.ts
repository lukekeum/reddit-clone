import { validate } from 'class-validator'
import { Service } from 'typedi'
import { EntityRepository, getCustomRepository, Repository } from 'typeorm'
import { User } from './User'
import { decode, JwtPayload, sign } from 'jsonwebtoken'
import { RefreshTokenRepository } from '../refreshToken/RefreshTokenRepository'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@src/constant'

@Service()
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  public async findOneByEmail(email: string): Promise<User | undefined> {
    return await this.findOne({ where: { email } })
  }

  public async findOneById(id: string): Promise<User | undefined> {
    return await this.findOne({ where: { id } })
  }

  public async findOneByUsername(username: string): Promise<User | undefined> {
    return await this.findOne({ where: { username } })
  }

  public async createAndValidate(data: Partial<User>): Promise<User> {
    const user = new User(data)
    const errors = await validate(user)
    return new Promise<User>((res, rej) => {
      if (errors.length > 0) return rej(errors)
      res(user)
    })
  }

  public async generateToken(
    user: User,
    tokenId?: string
  ): Promise<readonly [string, string]> {
    const refreshTokenRepository = getCustomRepository(RefreshTokenRepository)

    if (!tokenId) {
      const authToken = await refreshTokenRepository
        .create({ fk_user_id: user.id })
        .save()
      tokenId = authToken.id
    }

    const refreshToken = sign(
      { userId: user.id, tokenId: tokenId },
      REFRESH_TOKEN_SECRET,
      {
        subject: 'refresh_token',
        expiresIn: '30d',
      }
    )

    const accessToken = sign({ userId: user.id }, ACCESS_TOKEN_SECRET, {
      subject: 'access_token',
      expiresIn: '1h',
    })

    return [refreshToken, accessToken] as const
  }

  public async refreshToken(
    user: User,
    refreshToken: string,
    accessToken = ''
  ): Promise<readonly [string, string] | []> {
    const now = new Date().getTime()
    const { exp: refreshTokenExp, tokenId } = decode(
      refreshToken
    ) as DecodedRefreshToken
    const diff = (refreshTokenExp || 0) * 1000 - now

    if (diff < 1000 * 60 * 60 * 24 * 15) {
      const [newRefreshToken, newAccessToken] = await this.generateToken(
        user,
        tokenId
      )
      refreshToken = newRefreshToken
      accessToken = newAccessToken

      return [refreshToken, accessToken] as const
    }

    return []
  }
}

export interface DecodedRefreshToken extends JwtPayload {
  userId: string
  tokenId: string
}
