import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, BaseEntity, ManyToOne, } from 'typeorm';
import { Shop } from './shop.model';
import { User } from './user.model';


@Entity()
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    (type) => User,
    (user) => user.id,
  )
  user!: User;

  @ManyToOne(
    (type) => Shop,
    (shop) => shop.id,
  )
  shop!: Shop;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

