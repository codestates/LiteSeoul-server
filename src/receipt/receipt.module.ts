import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { Receipt } from 'src/models/receipt.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/models/user.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt, User]),
    JwtModule.register({
      secret: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService],
})
export class ReceiptModule {}
