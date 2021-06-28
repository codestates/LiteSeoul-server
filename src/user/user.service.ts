import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
	
	// 랭킹: 사용자
	getRank() {
		return 'this is getRank service';
	}

	// 로그인
	signIn() {
		return 'this is signin service';
	}

	// 로그아웃
	signOut() {
		return 'this is signout service';
	}

	// 회원가입
	signUp() {
		return 'this is singup service;'
	}




}
