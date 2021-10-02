import { IsString } from 'class-validator'
import { Field, ID } from 'type-graphql'
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

  @Column('uuid')
  fk_owner_id: string

  @Column('uuid', { array: true })
  fk_posts_id: string[]

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  banner_img: string | null

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  profile_img: string | null

  @ManyToOne(() => User)
  @JoinColumn({ name: 'fk_owner_id', referencedColumnName: 'id' })
  owner: User

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
