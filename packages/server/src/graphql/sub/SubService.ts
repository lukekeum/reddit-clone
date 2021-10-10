import { Sub } from '@src/entities/sub/Sub'
import { SubRepository } from '@src/entities/sub/SubRepository'
import { ForbiddenError } from 'apollo-server-errors'
import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'

@Service()
export class SubService {
  @InjectRepository(Sub)
  private subRepository: SubRepository

  public async createSub(
    name: string,
    userId: string | undefined
  ): Promise<Sub> {
    if (!userId) throw new Error('UserId is required')

    try {
      const sub = await this.subRepository.createSub({
        name,
        fk_owner_id: userId,
      })

      await sub.save()

      return sub
    } catch (err) {
      throw new ForbiddenError('Name sub already exists')
    }
  }
}
