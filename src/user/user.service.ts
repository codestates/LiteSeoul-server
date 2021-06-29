import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../models/user.model';

@Injectable()
export class UserService {

	constructor(@InjectRepository(User) private userRepository: Repository<User>){}
	
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
	async signUp(userInfo): Promise<User|string> {
		const { email, password, name, nick } = userInfo;

		// 이메일이 존재하는 지 확인. 존재하면 돌려보내
		let existEmail = await this.userRepository.findOne({ email })
		if (existEmail) {
			return '이미 존재하는 이메일입니다@@@@@@@@@@@@@@@@';
		} else {
			// 비밀번호 해싱
			const salt = await bcrypt.genSalt(); // 솔트
			const hashedPaword = await bcrypt.hash(password, salt);

			// 사용자 저장
			const newUser = this.userRepository.create({
				email, password: hashedPaword, name, nick, salt
			});
			
			return this.userRepository.save(newUser);
		}
	}
}
