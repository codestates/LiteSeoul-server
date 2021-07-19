import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/models/comment.model';
import { Like } from 'src/models/like.model';
import { Shop } from 'src/models/shop.model';
import { User } from 'src/models/user.model';
import { Visit } from 'src/models/visit.model';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Shop, Like, Comment, Visit]),
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [ShopService, UserService],
  controllers: [ShopController],
})
export class ShopModule {}
