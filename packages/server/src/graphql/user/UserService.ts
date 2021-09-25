import { User } from '@src/entities/user/User'
import { UserRepository } from '@src/entities/user/UserRepository'
import { AuthenticationError } from 'apollo-server-errors'
import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { compare } from 'bcrypt'
import { verify } from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET } from '@src/constant'

export interface LoginReturn {
  user: User
  token: {
    accessToken: string
    refreshToken: string
  }
}

@Service()
export default class UserService {
  @InjectRepository(User)
  private readonly userRepository: UserRepository

  public async register(
    email: string,
    username: string,
    password: string
  ): Promise<User> {
    const user = await this.userRepository.createAndValidate({
      email,
      username,
      password,
    })

    await user.save()

    return user
  }

  public async login(username: string, password: string): Promise<LoginReturn> {
    const user = await this.userRepository.findOneByUsername(username)

    if (!user) throw new AuthenticationError('User not Found')

    const comparePassword = await compare(password, user.password)
    if (!comparePassword) throw new AuthenticationError('Invalid Password')

    const tokens = this.userRepository.generateToken(user)

    return {
      user,
      token: {
        refreshToken: tokens[0],
        accessToken: tokens[1],
      },
    }
  }
}
