import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, BaseEntity, ManyToOne, } from 'typeorm';
import { Shop } from './shop.model';
import { User } from './user.model';


@Entity()
export class Visit extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    (type) => User,
    (user) => user.id,
  )
  user: User;

  @ManyToOne(
    (type) => Shop,
    (shop) => shop.id,
  )
  shop: Shop;

  @Column()
  visitCnt: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
