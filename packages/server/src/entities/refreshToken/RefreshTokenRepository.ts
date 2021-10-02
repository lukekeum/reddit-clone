import { Service } from 'typedi'
import { EntityRepository, Repository } from 'typeorm'
import { RefreshToken } from './RefreshToken'

@Service()
@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends Repository<RefreshToken> {}
