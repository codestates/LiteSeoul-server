import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Shop } from 'src/models/shop.model';
import { ShopService } from './shop.service';
import fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';


@Controller('shop')
export class ShopController {

  constructor(private readonly shopService: ShopService) {}
  
  // 랭킹: 샵
  @Get('rank')
  getRank() {
    return this.shopService.getRank();
  }

  @Get('getAll')
  getAll() {
    return this.shopService.getAll();
  }

  // 샵 상세조회
  @Get(':id')
  getShopInfo(@Param() id: number) {
    return this.shopService.getShopInfo(id);
  }

  // 카테고리별 샵 목록
  @Get('category/:categoryName')
  getShopsByCategory(@Param() category: Shop) {
    return this.shopService.getShopsByCategory(category);
  }

  // 자주 방문한 샵 목록
  @Get('manyVisits/:userId')
  getManyVisits(@Param() userId: number) {
    return this.shopService.getManyVisits(userId);
  }

  // 좋아요
  @Post('likeToggle') 
  likeToggle(@Body() likeInfo: any) {
    return this.shopService.likeToggle(likeInfo);
  }

  // 댓글 달기
  @Post('comment')
  writeComment(@Body() commentInfo: any) {
    return this.shopService.writeComment(commentInfo);
  }

  // 샵 추천 --- near, recycle, antiPlastic, antiChemical
  @Post('recommend')
  getShopsByRecommend(@Body() userInfo: any) {
    return this.shopService.getShopsByRecommend(userInfo);
  }

  // 샵 대표 이미지 저장을 위한 fileInterceptor
  @UseInterceptors(
    FileInterceptor('storeImg', {
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

  // 샵 등록
  @Post('register')
  registerShop(@Body() shopInfo: any, @UploadedFile() file: Express.Multer.File) {
    return this.shopService.registerShop(shopInfo, file)
  }
}