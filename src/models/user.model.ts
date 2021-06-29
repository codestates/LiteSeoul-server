import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany, } from 'typeorm';
import { Like } from './like.model';

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
  salt?: string;

  @Column()
  snsId?: string;

  @Column()
  profileImgPath?: string;

  @Column()
  profileText?: string;

  @Column()
  level?: number;

  @Column()
  currentExp?: number;

  @Column()
  maxExp?: number;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

}
