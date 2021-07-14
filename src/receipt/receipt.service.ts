import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFile } from 'fs';
import { Receipt } from 'src/models/receipt.model';
import { User } from 'src/models/user.model';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt) private receiptRepository: Repository<Receipt>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {}

  async list(id) {
    return await this.receiptRepository.find({ user: id });
  }

  async add(body, file) {
    const user = await this.userService.getOne(body.access_token);
    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const check = await this.receiptRepository.findOne({
      where: { imgName: file.originalname, user: user.id },
    });
    if (check) {
      throw new ConflictException('이미 등록된 영수증 입니다.');
    }
    const receiptImgPath = `${process.env.SERVER_URL}uploads/${file.originalname}`;
    let number: string = '';

    try {
      var Tesseract = require('tesseract.js');
      const result = await Tesseract.recognize(
        `${process.env.SERVER_URL}uploads/${file.originalname}`,
        'kor',
      );
      const line = result.data.text.split(`\n`);
      const sentence = line.find(
        (data) =>
          (data.includes('사') ||
            data.includes('샤') ||
            data.includes('삿') ||
            data.includes('시')) &&
          (data.includes('업') || data.includes('엄')),
      );

      for (let i = 0; i < sentence.length; i++) {
        if (sentence[i] === ' ') {
          continue;
        } else if ('1234567890'.includes(sentence[i])) {
          number = number + sentence[i];
        }
        if (number.length === 10) {
          break;
        }
      }
      // return number;
    } catch (error) {
      throw new BadRequestException('영수증을 다시 찍어주세요.');
    }

    const receipt = {
      user: user.id,
      imgPath: receiptImgPath,
      imgName: file.originalname,
      shopNumber: Number(number),
    };
    await this.receiptRepository.save(receipt);
    let { level, currentExp, maxExp } = user;
    currentExp = currentExp + 50;
    if (currentExp >= maxExp) {
      level = level + 1;
      maxExp = maxExp + 200;
      currentExp = 0;
    }
    const update = { level, maxExp, currentExp };
    await this.userRepository.save({ ...user, ...update });

    return { receipt, user: { ...user, ...update } };
  }

  async delete(target) {
    const receipt = await this.receiptRepository.findOne({
      imgName: target,
    });
    if (!receipt) {
      throw new NotFoundException('존재하지 않는 영수증입니다.');
    } else {
      await this.receiptRepository.delete({
        imgName: target,
      });
      return { message: '영수증 정보가 삭제되었습니다.' };
    }
  }
}
