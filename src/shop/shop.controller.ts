import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Shop } from 'src/models/shop.model';
// import { Shop } from 'src/models/shop.model';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {

	constructor(private readonly shopService: ShopService) { }
	
	// 랭킹: 샵
	@Get('rank')
	getRank() {
		return this.shopService.getRank();
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

	// 좋아요
	@Post('likeToggle') 
	likeToggle(@Body() likeInfo: any) {
		return this.shopService.likeToggle(likeInfo);
	}

	// 샵 추천 --- near, recycle, antiPlastic, antiChemical
	@Post('recommend')
	getShopsByRecommend(@Body() userInfo: any) {
		return this.shopService.getShopsByRecommend(userInfo);
	}
	

}
