import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { readdirSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, basename } from 'path';
import { UserService } from './user.service';

try {
  readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  mkdirSync('uploads');
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 랭킹: 사용자
  @Get('rank')
  getRank() {
    return this.userService.getRank();
  }

  // 로그인
  @Post('signin')
  signIn(@Body() body) {
    return this.userService.signIn(body);
  }

  // 로그아웃
  @Post('signout')
  signOut() {
    return this.userService.signOut();
  }

  @UseInterceptors(
    FileInterceptor('UserImg', {
      storage: diskStorage({
        destination(req, file, cb) {
          cb(null, 'uploads/');
        },
        filename(req, file, cb) {
          cb(null, file.originalname);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @Post('signup')
  signUp(@Body() body, @UploadedFile() file: Express.Multer.File) {
    return this.userService.signUp(body, file);
  }
}
