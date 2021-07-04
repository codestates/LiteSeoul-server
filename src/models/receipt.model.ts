import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { User } from './user.model';

@Entity()
export class Receipt extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(
  //   (type) => User,
  //   (user) => user.id,
  // )
  @Column()
  user: number;

  @Column()
  imgPath: string;

  @Column()
  imgName: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
