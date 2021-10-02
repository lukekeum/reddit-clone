import { IsString, Length } from 'class-validator'
import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Sub } from '../sub/Sub'

@ObjectType()
@Entity('posts')
export class Post extends BaseEntity {
  constructor(post: Partial<Post>) {
    super()
    Object.assign(this, post)
  }

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('uuid')
  fk_user_id: string

  @Column('uuid', { nullable: true })
  fk_sub_name: string

  @Column('uuid', { array: true })
  fk_votes_id: string[]

  @Column('uuid', { nullable: true })
  fk_parent_id: string

  @Field(() => Boolean)
  @Column('bool', { default: false })
  is_comment: boolean

  @Index()
  @Field(() => String)
  @Column('varchar')
  identifier: string

  @Index()
  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  slug: string | null

  @Field(() => String, { nullable: true })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  @Column('varchar', { nullable: true })
  title: string

  @Field(() => String)
  @IsString({ message: 'Content must be a string' })
  @Column('varchar')
  content: string

  @Field(() => Sub, { nullable: true })
  @ManyToOne(() => Sub, (sub) => sub.posts, { nullable: true })
  @JoinColumn({ name: 'fk_sub_name', referencedColumnName: 'name' })
  sub: Sub

  @Field(() => Post, { nullable: true })
  @ManyToOne(() => Post, (post) => post.parent, { nullable: true })
  @JoinColumn({ name: 'fk_parent_id', referencedColumnName: 'id' })
  parent: Post

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @BeforeInsert()
  generateSlugAndIdentifier(): void {
    this.identifier = makeIdentifier(6)
    this.slug = this.is_comment ? null : makeSlug(this.title)
  }
}

function makeSlug(str: string): string {
  str = str.trim()
  str = str.toLowerCase()

  // remove accents, swap ñ for n, etc
  const from = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;'
  const to = 'aaaaaaeeeeiiiioooouuuunc------'

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  return str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, '') // trim - from end of text
    .replace(/-/g, '_')
}

function makeIdentifier(length: number): string {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  Array(length)
    .fill('')
    .forEach(() => {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    })

  return text
}