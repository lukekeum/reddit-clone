import { Service } from 'typedi'
import { EntityRepository, Repository } from 'typeorm'
import { Sub } from './Sub'

@Service()
@EntityRepository(Sub)
export class SubRepository extends Repository<Sub> {}
