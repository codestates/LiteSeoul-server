import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/models/comment.model';
import { Like } from 'src/models/like.model';
import { Shop } from 'src/models/shop.model';
import { User } from 'src/models/user.model';
import { Visit } from 'src/models/visit.model';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Shop, Like, Comment, Visit]),
	],
	providers: [ShopService],
	controllers: [ShopController]
})
export class ShopModule {}
