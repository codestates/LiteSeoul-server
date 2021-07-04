import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Receipt } from 'src/models/receipt.model';
import { User } from 'src/models/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt) private receiptRepository: Repository<Receipt>,
    @InjectRepository(User) private userRepository: Repository<User>,
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

  async add(user, file) {
    const check = await this.receiptRepository.findOne({
      where: { imgName: file.originalname },
    });
    if (check) {
      throw new ConflictException('이미 존재하는 영수증 입니다.');
    }
    if (user.snsId === 'local') {
      const receiptImgPath = `${process.env.SERVER_URL}uploads/${file.originalname}`;
      console.log(receiptImgPath);
      const target = await this.userRepository.findOne({
        where: { email: user.email },
      });
      const receipt = {
        user: target.id,
        imgPath: receiptImgPath,
        imgName: file.originalname,
      };
      console.log(receipt);
      await this.receiptRepository.save(receipt);

      return receipt;
    } else {
      const receiptImgPath = `${process.env.SERVER_URL}uploads/${file.originalname}`;
      console.log(receiptImgPath);
      const target = await this.userRepository.findOne({
        where: { snsId: user.snsId },
      });
      const receipt = {
        user: target.id,
        imgPath: receiptImgPath,
        imgName: file.originalname,
      };
      await this.receiptRepository.save(receipt);
      return receipt;
    }
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
