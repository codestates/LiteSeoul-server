import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany, } from 'typeorm';
import { Like } from './like.model';
import { Visit } from './visit.model';


@Entity()
export class Shop extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column()
  category: string;

  @Column()
  recommend: string;

  @Column()
  phone: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ======================================== 관계 설정
  @OneToMany(() => Like, (like) => like.shop)
  like: Like[];

  @OneToMany((type) => Visit, visit => visit.shop)
  visit: Visit[];

}
