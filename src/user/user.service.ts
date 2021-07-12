import {
  ConflictException,
  ForbiddenException,
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

    return users.slice(0, 9);
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
      this.sendMail(email, name);
      return result;
    }
  }

  // 회원정보 수정
  async update(body, file) {
    const target = await this.jwtService.verify(body.access_token);
    const { id } = target;
    const user = await this.userRepository.findOne({ id });
    const hashedPaword = await bcrypt.hash(body.password, user.salt);
    if (!(user.password === hashedPaword)) {
      throw new ForbiddenException('비밀번호가 일치하지 않습니다.');
    }
    const profileImgPath = `${process.env.SERVER_URL}uploads/${file.originalname}`;
    user.profileImgPath = profileImgPath;
    user.nick = body.nick;
    user.phone = body.phone;
    user.profileText = body.profileText;
    await this.userRepository.save(user);
    return user;
  }

  // 회원정보 변경 (이미지 없이)
  async changeinfo(body) {
    const target = await this.jwtService.verify(body.access_token);
    const { id } = target;
    const user = await this.userRepository.findOne({ id });
    const hashedPaword = await bcrypt.hash(body.password, user.salt);
    if (!(user.password === hashedPaword)) {
      throw new ForbiddenException('비밀번호가 일치하지 않습니다.');
    }
    user.nick = body.nick;
    user.phone = body.phone;
    user.profileText = body.profileText;
    await this.userRepository.save(user);
    return user;
  }

  // 회원탈퇴
  async delete(token) {
    const user = await this.getOne(token);
    await this.userRepository.delete({ id: user.id });
    return { message: '정상적으로 탈퇴되었습니다.' };
  }

  // 가입 감사 이메일 보내기
  async sendMail(email, name) {
    try {
      const nodemailer = require('nodemailer');

      let transporter = nodemailer.createTransport({
        service: 'Naver',
        host: 'smtp.naver.com',
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_EMAIL, // generated ethereal user
          pass: process.env.MAIL_PASSWORD, // generated ethereal password
        },
        tls: { rejectUnauthorized: false },
      });

      let info = await transporter.sendMail({
        from: process.env.MAIL_EMAIL, // sender address
        to: `${email}`, // list of receivers
        subject: `${name}님 환경 지키기에 동참해주셔서 감사합니다.`, // Subject line
        text: '[변수명 : 고객 이름이나 닉네임] 님 환경 지키기에 동참해주셔서 감사합니다.', // plain text body
        html: `<b> <h1>Lite Seoul</h1> 
        <br> <h2>"당신의 서울, 서울을 깨끗하게"</h2>
        <br> 지금, 아픈 지구를 살리기 위해 당신의 손길이 필요합니다.
        <br>우리가 서 있고 천만시민이 살아가는 서울을 먼저 살리기 위해 만들었습니다.
        <br> 
        <br> 
        <br> <h2>"서울의 '제로 웨이스트 샵(Zero Waste Shop)'을 찾아드릴게요"</h2>
        <br>탄소중립시대인 '넷제로(Net-Zero)'를 위해 함께 동참해주세요.
        <br>당신 근처에서 환경을 위해 재생용기를 사용하고
        <br>1회용품과 화학용품을 없앤 '제로 웨이스트 샵(Zero Waste Shop)'을 만나보세요.
        <br> 
        <br> 
        <br> <h2>"우리가 기억합니다, 당신의 제로 웨이스트(Zero Waste)"</h2>
        <br>제로 웨이스트 샵에서 구매한 영수증 혹은 인증샷을 올려주세요!
        <br>점수를 산정하여 매 달 상위권에 계신 분들의 명의로 서울시내 결식아동 구호관련 기부를 진행합니다 ;)`, // html body
      });

      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (err) {
      console.error(err);
    }
  }
}
