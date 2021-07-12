import { HttpService, Controller, Post, Body, Get, Res } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { JwtService } from '@nestjs/jwt';

@Controller('kakao')
export class KakaoController {
  constructor(private kakaoService: KakaoService) {}

  @Post('login')
  async kakaoLogin(@Body() body) {
    console.log(body);
    const { kakaoToken } = body;
    this.kakaoService.setToken(kakaoToken);
    let info = await this.kakaoService.info();
    this.kakaoService.addNewUser(info.data);
    const access_token = this.kakaoService.getToken(info.data.id);
    return access_token;
  }

  @Get('logout')
  kakaologout(@Res() res): void {
    console.log(`LOGOUT TOKEN : ${this.kakaoService.accessToken}`);
    // 로그아웃
    this.kakaoService
      .logout()
      .then((e) => {
        return res.send(`
          <div>
            <h2>로그아웃 완료(연결끊기)</h2>
            <a href="/kakao/login">메인 화면으로</a>
          </div>
        `);
      })
      .catch((e) => {
        console.log(e);
        return res.send('DELETE ERROR');
      });
  }
}
