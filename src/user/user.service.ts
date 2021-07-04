import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../models/user.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 랭킹: 사용자
  async getRank() {
    const users = await this.userRepository.find();
    users.sort((a, b) => {
      if (a.level > b.level) {
        return -1;
      }
      if (a.level < b.level) {
        return 1;
      }
      return 0;
    });

    return users.slice(0, 5);
  }

  // 로그인
  async signIn(body) {
    const { email, password } = body;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('조회된 사용자 정보가 없습니다.');
    }
    const hashedPaword = await bcrypt.hash(password, user.salt);

    if (user.password === hashedPaword) {
      const { password, ...payload } = user;
      const access_token = this.jwtService.sign(payload);
      console.log(this.jwtService.verify(access_token));
      return { access_token, payload };
    }
  }

  // 로그아웃
  signOut() {}

  // 회원가입
  async signUp(Body, File) {
    const { email, password, name, nick } = Body;

    // 이메일이 존재하는 지 확인. 존재하면 돌려보내
    let existEmail = await this.userRepository.findOne({ where: { email } });
    if (existEmail) {
      throw new ConflictException('이미 존재하는 계정입니다.');
    } else {
      // 비밀번호 해싱
      const salt = await bcrypt.genSalt(); // 솔트
      const hashedPaword = await bcrypt.hash(password, salt);
      const profileImgPath = `${process.env.SERVER_URL}uploads/${File.originalname}`;
      console.log(profileImgPath);
      await this.userRepository.save({
        email,
        password: hashedPaword,
        name,
        nick,
        snsId: 'local',
        salt,
        profileImgPath,
      });
      const result = {
        email,
        password: hashedPaword,
        name,
        nick,
        snsId: 'local',
        salt,
        profileImgPath,
      };
      return result;
    }
  }
}
