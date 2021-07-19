import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Like } from './like.model';
import { Receipt } from './receipt.model';
import { Visit } from './visit.model';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

  @Column()
  password?: string;

  @Column()
  email?: string;

  @Column()
  nick?: string;

  @Column()
  phone?: string;

  @Column()
  salt?: string;

  @Column()
  snsId?: string;

  @Column()
  profileImgPath?: string;

  @Column()
  profileText?: string;

  @Column({default: 1})
  level?: number;

  @Column()
  currentExp?: number;

  @Column()
  maxExp?: number;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  // ======================================== 관계 설정
  @OneToMany(() => Like, (like) => like.user, {
    cascade: false,
  })
  like: Like[];

  @OneToMany(() => Visit, (visit) => visit.user, {
    cascade: false,
  })
  visit: Visit[];

  @OneToMany(() => Receipt, (receipt) => receipt.user, {
    cascade: false,
  })
  receipt: Receipt[];
}
