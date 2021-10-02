import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Post } from '../post/Post'
import { User } from '../user/User'

@ObjectType()
@Entity('votes')
export class Vote extends BaseEntity {
  constructor(vote: Partial<Vote>) {
    super()
    Object.assign(this, vote)
  }

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('uuid')
  fk_user_id: string

  @Column('uuid')
  fk_post_id: string

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id', referencedColumnName: 'id' })
  user: User

  @Field(() => Post)
  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_post_id', referencedColumnName: 'id' })
  post: Post

  @Field(() => Number)
  @Column('int', { default: 0 })
  value: number
}
