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
import { UserModule } from './user/user.module';
import { KakaoModule } from './kakao/kakao.module';
import { ShopModule } from './shop/shop.module';
import { ConfigModule } from '@nestjs/config';
import { ReceiptModule } from './receipt/receipt.module';
import { GoogleModule } from './google/google.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: 3306,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Like, Visit, Receipt, Shop, Comment],
      synchronize: false,
    }),
    UserModule,
    KakaoModule,
    ShopModule,
    ReceiptModule,
    GoogleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
