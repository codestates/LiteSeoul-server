import { HttpService, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.model';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class KakaoService {
  check: boolean;
  accessToken: string;
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  setToken(token: string): boolean {
    this.accessToken = token;
    return true;
  }

  async info(): Promise<any> {
    const _url = 'https://kapi.kakao.com/v2/user/me';
    const _header = {
      Authorization: `bearer ${this.accessToken}`,
    };
    return await this.httpService.get(_url, { headers: _header }).toPromise();
  }

  async addNewUser(data) {
    const {
      id,
      properties: { nickname, profile_image },
    } = data;
    const user = await this.userRepository.findOne({ where: { snsId: id } });
    if (!user) {
      const salt = await bcrypt.genSalt();
      const hashedPaword = await bcrypt.hash('0000', salt);
      const result = {
        nick: nickname,
        snsId: id,
        profileImgPath: profile_image,
        maxExp: 500,
        password: hashedPaword,
        salt,
      };
      await this.userRepository.save(result);

      const newUser = await this.userRepository.findOne({
        where: { snsId: id },
      });
      console.log('=========', newUser.id);
      return newUser.id;
    } else {
      return user.id;
    }
  }

  async getToken(snsId) {
    const user = await this.userRepository.findOne({ where: { snsId } });
    const id = user.id;
    return await this.jwtService.sign({ id });
  }

  async logout(): Promise<any> {
    const _url = 'https://kapi.kakao.com/v1/user/unlink';
    const _header = {
      Authorization: `bearer ${this.accessToken}`,
    };
    return await this.httpService
      .post(_url, '', { headers: _header })
      .toPromise();
  }
}
