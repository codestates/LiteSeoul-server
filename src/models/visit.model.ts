import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, BaseEntity, ManyToOne, } from 'typeorm';
import { Shop } from './shop.model';
import { User } from './user.model';


@Entity()
export class Visit extends BaseEntity {
  // ======================================== 컬럼
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  shopId: number;

  @Column()
  visitCnt: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ======================================== 관계 설정
  @ManyToOne(() => User, (user) => user.visit)
  user: User;

  @ManyToOne(() => Shop, (shop) => shop.visit)
  shop: Shop;
}
