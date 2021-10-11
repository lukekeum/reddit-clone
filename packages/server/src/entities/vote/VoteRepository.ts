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

  public async findVoteByPostIdAndUserId(
    post_id: string,
    user_id: string
  ): Promise<Vote | undefined> {
    const vote = await this.createQueryBuilder('vote')
      .where('vote.fk_post_id = :fk_post_id', { fk_post_id: post_id })
      .andWhere('vote.fk_user_id = :fk_user_id', { fk_user_id: user_id })
      .getOne()
    return vote
  }
}
