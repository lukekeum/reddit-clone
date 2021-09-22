import { validate } from 'class-validator'
import { Service } from 'typedi'
import { EntityRepository, Repository } from 'typeorm'
import { User } from './User'
import * as jwt from 'jsonwebtoken'

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

  public generateToken(user: User): readonly [string, string] {
    const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = process.env

    if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET)
      throw new Error('Secret not found')

    const refreshToken = jwt.sign(
      { userId: user.id, count: user.tokenVersion },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: '7d',
      }
    )

    const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, {
      expiresIn: '15min',
    })

    return [refreshToken, accessToken] as const
  }
}
