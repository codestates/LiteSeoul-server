import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from 'src/models/user.model';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

	constructor(private readonly userService: UserService) { }

	// 랭킹: 사용자
	@Get('rank')
	getRank() {
		return this.userService.getRank();
	}

	// 로그인
	@Post('signin')
	signIn() {
		return this.userService.signIn();
	}

	// 로그아웃
	@Post('signout')
	signOut() {
		return this.userService.signOut();
	}

	// 회원가입
	// @Post('signup')
	// signUp(
	// 	@Body('email') email: string,
	// 	@Body('password') password: string,
	// 	@Body('name') name: string,
	// 	@Body('nick') nick: string,) {
	// 	return this.userService.signUp(email, password, name, nick);
	// }

	@Post('signup')
	signUp(@Body() userInfo: User) {
		return this.userService.signUp(userInfo);
	}
}
