import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user.model';
import { KakaoController } from './kakao.controller';
import { KakaoService } from './kakao.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [KakaoController],
  providers: [KakaoService],
})
export class KakaoModule {}
