import { IsString, Length, maxLength } from 'class-validator'
import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Post } from '../post/Post'
import { User } from '../user/User'

@ObjectType()
@Entity('subs')
export class Sub extends BaseEntity {
  constructor(sub: Partial<Sub>) {
    super()
    Object.assign(this, sub)
  }

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(() => String)
  @IsString({ message: 'Name must be string' })
  @Column('varchar', { unique: true })
  name: string

  @Field(() => String)
  @IsString({ message: 'Title must be string' })
  @Length(1, 30, { message: 'Title must be between 1 and 30 characters' })
  @Column('varchar')
  title: string

  @Field(() => String)
  @IsString({ message: 'Description must be string' })
  @Length(1, 255, { message: 'Description must be less than 255 characters' })
  @Column('varchar', { nullable: true })
  description: string

  @Column('uuid')
  fk_owner_id: string

  @Column('uuid', { array: true, nullable: true })
  fk_posts_id: string[]

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  banner_img: string | null

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  profile_img: string | null

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_owner_id', referencedColumnName: 'id' })
  owner: User

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.sub)
  @JoinColumn({ name: 'fk_posts_id', referencedColumnName: 'id' })
  posts: Post[]

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
