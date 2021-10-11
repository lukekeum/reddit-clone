import { Field, InputType } from 'type-graphql'

@InputType()
export class PostCreateInput {
  @Field()
  title: string

  @Field()
  content: string

  @Field()
  subName: string
}

@InputType()
export class PostVoteInput {
  @Field(() => Number)
  value: number

  @Field()
  identifier: string
}

@InputType()
export class CreateCommentInput {
  @Field()
  content: string

  @Field()
  parentIdentifier: string

  @Field()
  superParentIdentifier: string

  @Field()
  subName: string
}
