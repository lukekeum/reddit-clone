import { Post } from '@src/entities/post/Post'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import { Inject, Service } from 'typedi'
import { GraphQLContext } from '../schema'
import { CreateCommentInput, PostCreateInput, PostVoteInput } from './PostInput'
import { PostService } from './PostService'

@Service()
@Resolver(() => Post)
export class PostResolver {
  @Inject()
  private readonly postService: PostService

  @Mutation(() => Post)
  @Authorized()
  createPost(
    @Arg('input') input: PostCreateInput,
    @Ctx() context: GraphQLContext
  ): Promise<Post> {
    const { user } = context.payload
    const { content, title } = input

    const subName = input.subName.toLowerCase()

    if (!user) throw new AuthenticationError('User not found')

    return this.postService.createPost({
      subName,
      content,
      title,
      user,
    })
  }

  @Mutation(() => Number)
  @Authorized()
  votePost(
    @Arg('input') input: PostVoteInput,
    @Ctx() context: GraphQLContext
  ): Promise<number> {
    const { value, identifier } = input
    const { user } = context.payload

    if ([-1, 0, 1].find((v) => v === value) === undefined) {
      throw new UserInputError('Value must be 0, -1 or 1')
    }

    if (!user) throw new AuthenticationError('User not found')

    return this.postService.votePost({
      value,
      identifier,
      user,
    })
  }

  @Mutation(() => Post)
  @Authorized()
  createComment(
    @Arg('input') input: CreateCommentInput,
    @Ctx() context: GraphQLContext
  ): Promise<Post> {
    const { user } = context.payload
    const { content, parentIdentifier, superParentIdentifier, subName } = input

    if (!user) throw new AuthenticationError('User not found')

    return this.postService.createComment({
      content,
      superParentIdentifier,
      parentIdentifier,
      subName,
      user,
    })
  }
}
