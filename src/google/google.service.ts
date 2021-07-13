import { HttpService, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/models/user.model';
import { getRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GoogleService {
  accessToken: string;

  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  // 구글 로그인 클릭
  // googleLogin(req) {
  // 	console.log("=== GET  /google/auth/google/callback")
  // 	console.log("=== accessToken :", req.user.accessToken)

  // 	if (!req.user) {
  // 		return 'no user from gogole'
  // 	}

  // 	// 구글에서 넘겨받은 accessToken 셋팅!
  // 	this.setToken(req.user.accessToken)

  // 	return;
  // }

  // 토큰 셋팅하기
  setToken(token: string): boolean {
    console.log('=== setting google token in service :::', token);
    this.accessToken = token;
    return true;
  }

  // 구글 ouath 사용자 데이터베이스에 추가하기. 있으면 추가하지 않음.
  async addNewUser(data) {
    console.log('=== adding user in service :::', data);

    let userInfo;
    try {
      // 사용자 조회
      userInfo = await getRepository(User)
        .createQueryBuilder('user')
        .select()
        .where({ email: data.email })
        .getOne();

      // 사용자가 없으면? 추가!
      if (!userInfo) {
        const salt = await bcrypt.genSalt();
        const hashedPaword = await bcrypt.hash('0000', salt);
        await getRepository(User)
          .createQueryBuilder('user')
          .insert()
          .into(User)
          .values([
            {
              email: data.email,
              name: data.firstName + data.lastName,
              nick: data.firstName + data.lastName,
              profileImgPath: data.picture,
              salt,
              password: hashedPaword,
              maxExp: 500,
              snsId: 'google',
            },
          ])
          .execute();
      }
    } catch (e) {
      throw e;
    }

    return;
  }

  // 토큰 만들기
  async getToken(email) {
    console.log('=== making new access_token in service :::', email);

    const user = await getRepository(User)
      .createQueryBuilder('user')
      .select()
      .where({ email })
      .getOne();

    const id = user.id;
    const access_token = await this.jwtService.sign({ id });
    const payload = { id };
    console.log('=== new access_token in service :::', access_token);
    return { access_token, payload };
  }

  // 구글 로그아웃
  async googleLogout(): Promise<any> {
    const _url = `https://accounts.google.com/o/oauth2/revoke?token=${this.accessToken}`;
    // const _url = 'https://mail.google.com/mail/u/0/?logout&hl=en';
    // const _header = {
    //   Authorization: `bearer ${this.accessToken}`,
    // };
    return await this.httpService.post(_url).toPromise();
  }
}
