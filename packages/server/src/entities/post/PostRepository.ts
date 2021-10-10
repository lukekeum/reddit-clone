import { validate } from 'class-validator'
import { Service } from 'typedi'
import { EntityRepository, Repository } from 'typeorm'
import { Post } from './Post'

type BaseCommentType = Partial<Omit<Post, 'slug' | 'title'>> &
  Required<Pick<Post, 'content'>>

type CommentType = BaseCommentType &
  (
    | Required<Pick<Post, 'fk_parent_id' | 'fk_super_parent_id'>>
    | Required<Pick<Post, 'parent' | 'super_parent'>>
  )

@Service()
@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  public async createComment(comment: CommentType): Promise<Post> {
    const post = new Post(comment)
    const errors = await validate(post)
    return new Promise<Post>((res, rej) => {
      if (errors.length > 0) return rej(errors)
      res(post)
    })
  }

  public async getCommentNumber(post: Post): Promise<number> {
    const commentNumber = await this.createQueryBuilder('post')
      .select('COUNT(post.id)')
      .where('post.fk_super_parent_id = :fk_parent_id', {
        fk_parent_id: post.id,
      })
      .cache(1000 * 10)
      .getRawOne()
    return commentNumber ? commentNumber.count : 0
  }

  public findBySlug(slug: string): Promise<Post> {
    return this.findOneOrFail({ slug })
  }

  public findByIdentifier(identifier: string): Promise<Post> {
    return this.findOneOrFail({ identifier })
  }

  public getURL(post: Post): string | null {
    return post.is_comment
      ? null
      : `/r/${post.fk_sub_name}/${post.identifier}/${post.slug!}`
  }
}
