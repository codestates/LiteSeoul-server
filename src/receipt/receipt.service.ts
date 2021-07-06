import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async list(user) {
    if (user.snsId === 'local') {
      const target = await this.userRepository.findOne({
        where: { email: user.email },
      });
      return await this.receiptRepository.find({
        where: { user: target.id },
      });
    } else {
      const target = await this.userRepository.findOne({
        where: { snsId: user.snsId },
      });
      return await this.receiptRepository.find({
        where: { user: target.id },
      });
    }
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
      throw new ConflictException('이미 존재하는 영수증 입니다.');
    }
    const receiptImgPath = `${process.env.SERVER_URL}uploads/${file.originalname}`;

    const receipt = {
      user: user.id,
      imgPath: receiptImgPath,
      imgName: file.originalname,
    };
    console.log(receipt);
    await this.receiptRepository.save(receipt);
    let { level, currentExp, maxExp } = user;
    currentExp = currentExp + 50;
    if (currentExp >= maxExp) {
      level = level + 1;
      maxExp = maxExp + 200;
      currentExp = 0;
    }
    const update = { level, maxExp, currentExp };
    console.log({ ...user, ...update });
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
