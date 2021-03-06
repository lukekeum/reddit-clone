import { validate } from 'class-validator'
import { Service } from 'typedi'
import {
  EntityRepository,
  getCustomRepository,
  getManager,
  Repository,
} from 'typeorm'
import { Sub } from '../sub/Sub'
import { Post } from './Post'
import DataLoader from 'dataloader'

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

  public findCommentsByPostId(post_id: string): Promise<Post[]> {
    return this.createQueryBuilder('post')
      .where('post.fk_super_parent_id = :fk_super_parent_id', {
        fk_super_parent_id: post_id,
      })
      .orderBy('post.created_at', 'DESC')
      .getMany()
  }

  public findChildCommentByCommentId(comment_id: string): Promise<Post[]> {
    return this.createQueryBuilder('post')
      .where('post.fk_parent_id = :fk_parent_id', {
        fk_parent_id: comment_id,
      })
      .orderBy('post.created_at', 'DESC')
      .getMany()
  }

  public async batchPosts(subIds: readonly string[]): Promise<Post[][]> {
    const subs = await getManager()
      .createQueryBuilder(Sub, 'sub')
      .leftJoinAndSelect('sub.posts', 'post')
      .whereInIds(subIds)
      .andWhere('post.is_comment = false')
      .orderBy({ 'post.created_at': 'ASC' })
      .getMany()

    const normalized: { [key: string]: Sub } = {}

    subs.forEach((item) => {
      normalized[item.id] = item
    })

    return subIds.map((id) => (normalized[id] ? normalized[id].posts : []))
  }

  public async batchComments(
    postIdentifiers: readonly string[]
  ): Promise<Post[][]> {
    const posts = await getManager()
      .createQueryBuilder(Post, 'post')
      .leftJoinAndSelect('post.super_parent', 'parent')
      .where('parent.identifier = (: ... postIdentifiers)', { postIdentifiers })
      .andWhere('post.is_comment = true')
      .getMany()

    const normalized: { [key: string]: Post } = {}

    posts.forEach((item) => {
      normalized[item.identifier] = item
    })

    return postIdentifiers.map((id) => (normalized[id] ? [normalized[id]] : []))
  }
}

export const postLoader = (): DataLoader<string, Post[]> =>
  new DataLoader<string, Post[]>(
    (subIds: readonly string[]) => {
      return getCustomRepository(PostRepository).batchPosts(subIds)
    },
    { cache: false }
  )

export const commentLoader = (): DataLoader<string, Post[]> =>
  new DataLoader<string, Post[]>(
    (postIdentifiers: readonly string[]) => {
      return getCustomRepository(PostRepository).batchComments(postIdentifiers)
    },
    { cache: false }
  )
