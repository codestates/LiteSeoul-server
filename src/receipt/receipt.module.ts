import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { Receipt } from 'src/models/receipt.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/models/user.model';
import { UserService } from 'src/user/user.service';
import { Like } from 'src/models/like.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt, User, Like]),
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService, UserService],
})
export class ReceiptModule {}
