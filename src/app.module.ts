import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './models/user.model';
import { Like } from './models/like.model';
import { Visit } from './models/visit.model';
import { Receipt } from './models/receipt.model';
import { Shop } from './models/shop.model';
import { Comment } from './models/comment.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ShopController } from './shop/shop.controller';
import { ShopService } from './shop/shop.service';
import { UserModule } from './user/user.module';
import { KakaoModule } from './kakao/kakao.module';

require('dotenv').config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: 3306,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Like, Visit, Receipt, Shop, Comment],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    UserModule,
    KakaoModule,
  ],
  controllers: [AppController, ShopController],
  providers: [AppService, ShopService],
})
export class AppModule {}
