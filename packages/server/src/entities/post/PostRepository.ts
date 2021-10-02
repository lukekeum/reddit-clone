import { Service } from 'typedi'
import { EntityRepository, Repository } from 'typeorm'
import { Post } from './Post'

@Service()
@EntityRepository(Post)
export class PostRepository extends Repository<Post> {}
