import { Controller, Get, Header, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
require("dotenv").config();

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('user/upload')
	@UseInterceptors(FileInterceptor('image'))
	uploadFile(@UploadedFile() file) {
		console.log(file)
		return file;
	}

  // @Get('googleLogin')
  // @Header('Content-Type', 'text/html')
  // googleLoginLogic(@Res() res): void {
  //   const _clientId = process.env.GOOGLE_CLIENT_ID
  //   // 카카오 로그인 RedirectURI 등록
  //   const _redirectUrl = `http://localhost:3000`;
  //   const url = `https://accounts.google.com/o/oauth2/v2/auth?
  //   scope=https%3A//www.googleapis.com/auth/drive.metadata.readonly&
  //   access_type=offline&
  //   include_granted_scopes=true&
  //   response_type=code&
  //   redirect_uri=http://localhost:3000&
  //   client_id=916489353192-ta0ikpouok58v8phf6nv8clca8qc1vo2.apps.googleusercontent.com`;
  //   return res.redirect(url);
  // }
}
