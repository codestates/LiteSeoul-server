import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { GoogleService } from './google.service';

import { AuthGuard } from '@nestjs/passport';

@Controller('google')
export class GoogleController {
	constructor(private readonly googleService: GoogleService){}

	// 구글 로그인 버튼 클릭!
	@Get('login')
	@UseGuards(AuthGuard('google'))
	async googleAuth(@Req() req) {} // 없으면 안 됨...
	
	@Get('auth/google/callback')
	@UseGuards(AuthGuard('google'))
	googleAuthRedirect(@Req() req, @Res() res) {
		console.log('=== controller ::: google login on going');

		// this.googleService.googleLogin(req);
		this.googleService.setToken(req.user.accessToken); // 구글에서 받아온 토큰을 셋?
		this.googleService.addNewUser(req.user); // 리턴값 필요?
		const access_token = this.googleService.getToken(req.user.email); // 토큰 새로 만들어서 리턴?
		// this.googleAuthRedirect(req, res)
		return access_token;
	}

	// 구글 로그아웃
	@Get('logout')
	googleLogout(@Req() req, @Res() res) {
		console.log(`=== LOGOUT TOKEN : ${this.googleService.accessToken}`);
		
		this.googleService
      .googleLogout()
      .then((e) => {
        return res.send(`
          <div>
            <h2>로그아웃 완료(연결끊기)</h2>
            <a href="/google/login">메인 화면으로</a>
          </div>
        `);
      })
      .catch((e) => {
        console.log(e);
        return res.send('DELETE ERROR');
      });
		return;
	}
}
