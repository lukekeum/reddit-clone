import { Service } from 'typedi'
import { EntityRepository, Repository } from 'typeorm'
import { Vote } from './Vote'

@Service()
@EntityRepository(Vote)
export class VoteRepository extends Repository<Vote> {}
