import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class KakaoService {
  check: boolean;
  accessToken: string;
  private http: HttpService;
  constructor() {
    this.check = false;
    this.http = new HttpService();
    this.accessToken = '';
  }
  loginCheck(): void {
    this.check = !this.check;
    return;
  }
  async login(url: string, headers: any): Promise<any> {
    return await this.http.post(url, '', { headers }).toPromise();
  }
  setToken(token: string): boolean {
    this.accessToken = token;
    return true;
  }

  async info(): Promise<any> {
    const _url = 'https://kapi.kakao.com/v2/user/me';
    const _header = {
      Authorization: `bearer ${this.accessToken}`,
    };
    return await this.http.get(_url, { headers: _header }).toPromise();
  }

  async logout(): Promise<any> {
    const _url = 'https://kapi.kakao.com/v1/user/unlink';
    const _header = {
      Authorization: `bearer ${this.accessToken}`,
    };
    return await this.http.post(_url, '', { headers: _header }).toPromise();
  }
}
