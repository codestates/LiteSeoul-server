import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from 'src/models/user.model';
import { UserService } from './user.service';

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

  @Post('signup')
  signUp(@Body() Body: User) {
    return this.userService.signUp(Body);
  }
}
