import { Post } from '@src/entities/post/Post'
import { PostRepository } from '@src/entities/post/PostRepository'
import { SubRepository } from '@src/entities/sub/SubRepository'
import { User } from '@src/entities/user/User'
import { VoteRepository } from '@src/entities/vote/VoteRepository'
import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'

interface CreatePostParams {
  subName: string
  content: string
  title: string
  user: User
}

interface VotePostParams {
  value: number // -1 or 0 or 1
  identifier: string
  user: User
}

interface CreateCommentParams {
  superParentIdentifier: string
  parentIdentifier: string
  content: string
  subName: string
  user: User
}

@Service()
export class PostService {
  @InjectRepository()
  private readonly postRepository: PostRepository

  @InjectRepository()
  private readonly subRepository: SubRepository

  @InjectRepository()
  private readonly voteRepository: VoteRepository

  public async createPost({
    subName,
    content,
    title,
    user,
  }: CreatePostParams): Promise<Post> {
    const subData = await this.subRepository.findOneByName(subName)

    const post = await this.postRepository
      .create({
        title,
        content,
        fk_sub_name: subData.name,
        fk_user_id: user.id,
      })
      .save()

    return post
  }

  public async votePost({
    value,
    identifier,
    user,
  }: VotePostParams): Promise<number> {
    const post = await this.postRepository.findByIdentifier(identifier)

    const vote = await this.voteRepository.findVoteByPostIdAndUserId(
      post.id,
      user.id
    )

    if (!vote) {
      await this.voteRepository
        .create({
          value,
          fk_post_id: post.id,
          fk_user_id: user.id,
        })
        .save()

      return this.voteRepository.getVoteNumber(post.id)
    }

    vote.value = value

    await this.voteRepository.save(vote)

    return this.voteRepository.getVoteNumber(post.id)
  }

  public async createComment({
    content,
    parentIdentifier,
    superParentIdentifier,
    user,
  }: CreateCommentParams): Promise<Post> {
    const superPost = await this.postRepository.findByIdentifier(
      superParentIdentifier
    )
    const parentPost = await this.postRepository.findByIdentifier(
      parentIdentifier
    )

    const comment = await this.postRepository.createComment({
      user,
      is_comment: true,
      content,
      parent: parentPost,
      super_parent: superPost,
    })

    await comment.save()

    return comment
  }

  public getComments(post_id: string): Promise<Post[]> {
    return this.postRepository.findCommentsByPostId(post_id)
  }
}
