import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ReceiptService } from './receipt.service';
import { JwtService } from '@nestjs/jwt';

@Controller('receipt')
export class ReceiptController {
  constructor(
    private readonly receiptService: ReceiptService,
    private jwtService: JwtService,
  ) {}

  @Post('list')
  async get(@Body() body) {
    console.log(`=== POST  /receipt/list`);
    try {
      const target = await this.jwtService.verify(body.access_token);
      console.log(target.id);
      return this.receiptService.list(target.id);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination(req, file, cb) {
          cb(null, 'uploads/');
        },
        filename(req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  @Post('add')
  async add(@Body() body, @UploadedFile() file: Express.Multer.File) {
    console.log(`=== POST  /receipt/add`);
    return this.receiptService.add(body, file);
  }

  @Post('delete')
  async delete(@Body() body) {
    console.log(`=== POST  /receipt/delete`);
    try {
      const target = body.name;
      return this.receiptService.delete(target);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
