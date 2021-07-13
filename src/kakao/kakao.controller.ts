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
    await this.kakaoService.setToken(kakaoToken);
    let info = await this.kakaoService.info();
    await this.kakaoService.addNewUser(info.data);
    const access_token = await this.kakaoService.getToken(info.data.id);
    const payload = { id: info.data.id };
    return { access_token, payload };
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
