import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { KakaoService } from './kakao.service';

@Controller('kakao')
export class KakaoController {
  constructor(
    private readonly kakaoService: KakaoService,
  ) {}
  @Get('login')
  @Header('Content-Type', 'text/html')
  kakaologin(@Res() res): void {
    const _hostName = 'https://kauth.kakao.com';
    const _restApiKey = process.env.KAKAO_REST_API_KEY
    // 카카오 로그인 RedirectURI 등록
    const _redirectUrl = `${process.env.KAKAO_REDIRECT_URI}/kakao/loginLogic`;
    const url = `${_hostName}/oauth/authorize?client_id=${_restApiKey}&redirect_uri=${_redirectUrl}&response_type=code`;
    return res.redirect(url);
  }

  @Get('loginLogic')
  @Header('Content-Type', 'text/html')
  kakaologinLogic(@Query() qs, @Res() res): void {
    console.log(qs.code);
    const _restApiKey = process.env.KAKAO_REST_API_KEY; // * 입력필요
    const _redirect_uri = `${process.env.KAKAO_REDIRECT_URI}/kakao/loginLogic`;
    const _hostName = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${_restApiKey}&redirect_uri=${_redirect_uri}&code=${qs.code}`;
    const _headers = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    };
    this.kakaoService
      .login(_hostName, _headers)
      .then((e) => {
        console.log(`TOKEN : ${e.data['access_token']}`);
        this.kakaoService.setToken(e.data['access_token']);
        this.kakaoService.info()
          .then((e) => {
            console.log(e.data)
            return res.send(`
            <div>
              <h2>${e.data.properties.nickname}</h2>
              <img src=${e.data.properties.profile_image} />
              <img src=${e.data.properties.thumbnail_image} />
            </div>
          `);
        })
      })
      .catch((err) => {
        console.log(err);
        return res.send('error');
      });
  }
  // 카카오 로그인 -> 고급에서 로그아웃 Logout Redirect URI 설정 필요
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
