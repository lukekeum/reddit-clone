import { Service } from 'typedi'
import { EntityRepository, Repository } from 'typeorm'
import { validate } from 'class-validator'
import { Sub } from './Sub'

type CreateSub = Partial<Sub> &
  Required<Pick<Sub, 'name' | 'title' | 'description'>>

@Service()
@EntityRepository(Sub)
export class SubRepository extends Repository<Sub> {
  public async createSub(sub: CreateSub): Promise<Sub> {
    const isSubExists = await this.createQueryBuilder('sub')
      .where('LOWER(sub.name) = :name', { name: sub.name.toLowerCase() })
      .getOne()

    if (isSubExists) throw new Error('Sub already exists')

    const subs = new Sub(sub)
    const errors = await validate(subs)
    return new Promise<Sub>((res, rej) => {
      if (errors.length > 0) return rej(errors)
      res(subs)
    })
  }

  public async getSub(name: string): Promise<Sub> {
    return this.createQueryBuilder('sub')
      .where('LOWER(sub.name) = :name', { name: name.toLowerCase() })
      .getOneOrFail()
  }

  public async searchSub(keyword: string): Promise<Sub[]> {
    return this.createQueryBuilder('sub')
      .where('LOWER(sub.name) LIKE :name', {
        name: keyword,
      })
      .getMany()
  }
}
