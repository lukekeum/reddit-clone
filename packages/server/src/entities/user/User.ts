import bcrypt from 'bcrypt'
import { classToPlain, Exclude } from 'class-transformer'
import { IsEmail, Length } from 'class-validator'
import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super()
    Object.assign(this, user)
  }

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Field({ nullable: false })
  @IsEmail(undefined, { message: 'Invalid email' })
  @Length(1, 255, { message: 'Email must be between 1 and 255 characters' })
  @Column('varchar', { unique: true })
  email: string

  @Index()
  @Field({ nullable: false })
  @Length(3, 255, { message: 'Username must be between 3 and 255 characters' })
  @Column('varchar', { unique: true })
  username: string

  @Exclude()
  @Column('varchar')
  password: string

  @Exclude()
  @Column('int', { name: 'token_version', default: 0 })
  tokenVersion: number

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10)
  }

  toJSON(): Record<string, unknown> {
    return classToPlain(this)
  }
}
