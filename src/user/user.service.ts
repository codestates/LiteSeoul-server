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

  // 유저 정보
  async getOne(token) {
    try {
      const target = await this.jwtService.verify(token);
      const { id } = target;
      console.log(id);
      const user = await this.userRepository.findOne({ id });
      const { password, salt, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

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
    try {
      const { email, password } = body;
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('조회된 사용자 정보가 없습니다.');
      }
      const hashedPaword = await bcrypt.hash(password, user.salt);

      if (user.password === hashedPaword) {
        let { password, ...payload } = user;
        const id = user.id;
        console.log(id);
        const access_token = this.jwtService.sign({ id });
        console.log(this.jwtService.verify(access_token));
        return { access_token, payload };
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 회원가입
  async signUp(Body, File) {
    const { email, password, name, nick, phone } = Body;

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
      const result = {
        email,
        password: hashedPaword,
        name,
        nick,
        phone,
        snsId: 'local',
        salt,
        profileImgPath,
        maxExp: 500,
      };
      await this.userRepository.save(result);
      return result;
    }
  }

  // 회원정보 수정
  async update(body) {
    const user = await this.getOne(body.access_token);
    if (body.email) {
      user.email = body.email;
    }
    if (body.password) {
      const salt = await bcrypt.genSalt(); // 솔트
      const hashedPaword = await bcrypt.hash(body.password, salt);
      user['salt'] = salt;
      user['password'] = hashedPaword;
    }
    if (body.name) {
      user.name = body.name;
    }
    if (body.nick) {
      user.nick = body.nick;
    }
    if (body.phone) {
      user.phone = body.phone;
    }
    if (body.profileText) {
      user.profileText = body.profileText;
    }
    await this.userRepository.save(user);
    return user;
  }

  // 프로필 사진 변경
  async changeProfile(token, file) {
    const user = await this.getOne(token);
    if (file) {
      const profileImgPath = `${process.env.SERVER_URL}uploads/${file.originalname}`;
      user.profileImgPath = profileImgPath;
    }
    await this.userRepository.save(user);
    return user;
  }

  // 회원탈퇴
  async delete(token) {
    const user = await this.getOne(token);
    await this.userRepository.delete({ id: user.id });
    return { message: '정상적으로 탈퇴되었습니다.' };
  }
}
