import { Controller, Get, Post } from '@nestjs/common';
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
	@Post('signup')
	signUp() {
		return this.userService.signUp();
	}

}
