import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../user/User'

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('uuid')
  fk_user_id: string

  @Column('timestampz')
  @CreateDateColumn()
  createdAt: Date

  @Column('timestampz')
  @UpdateDateColumn()
  updatedAt: Date

  @Column('boolean', { default: false })
  disabled: boolean

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: User
}
