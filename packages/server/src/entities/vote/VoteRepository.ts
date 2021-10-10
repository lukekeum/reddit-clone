import { Service } from 'typedi'
import { EntityRepository, Repository } from 'typeorm'
import { Vote } from './Vote'

@Service()
@EntityRepository(Vote)
export class VoteRepository extends Repository<Vote> {
  public async getVoteNumber(post_id: string, cache = true): Promise<number> {
    const voteNum = await this.createQueryBuilder('vote')
      .select('SUM(vote.value)')
      .where('vote.fk_post_id = :fk_post_id', { fk_post_id: post_id })
      .cache(cache)
      .getRawOne()

    return parseInt(voteNum.sum, 10) || 0
  }
}
