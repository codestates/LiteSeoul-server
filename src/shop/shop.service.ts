import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from 'src/models/shop.model';
import { getManager, getRepository, Repository } from 'typeorm';
import { Like } from 'src/models/like.model';
import { Comment } from 'src/models/comment.model';
import { Visit } from 'src/models/visit.model';
import { User } from 'src/models/user.model';

@Injectable()
export class ShopService {

	// constructor(
	// 	@InjectRepository(Shop) private shopRepository: Repository<Shop>,
	// 	@InjectRepository(Like) private likeRepository: Repository<Like>,
	// 	@InjectRepository(Comment) private commentRepository: Repository<Comment>,
	// 	@InjectRepository(Visit) private visitRepository: Repository<Visit>
	// ) {
	// 	this.shopRepository = shopRepository;
	// 	this.likeRepository = likeRepository;
	// 	this.commentRepository = commentRepository;
	// 	this.visitRepository = visitRepository;
	// }

	// ======================================================================== 랭킹: 샵 ::: GET  /shop/rank
	async getRank() {
		
		// 사용자 방문 횟수에 따른 랭킹
		let shopList = await getRepository(Shop)
			.createQueryBuilder("shop")
			// .limit(8)
			.leftJoinAndSelect("shop.visit", "visitList")
			.orderBy('visitList.visitCnt', 'DESC')
			.getMany();
		
		let cntManyCustomer;
		let cntPerCustomer;

		let rankedList = shopList.map(el => {
			// 샵에 방문한 사용자 수
			cntManyCustomer = el.visit.length;
			// 샵에 방문한 모든 사용자가 방문한 횟수
			cntPerCustomer = el.visit.reduce((acc, cur) => {
				return acc + cur.visitCnt;
			}, 0);
			
			// 샵에 totalPoint 추가
			el["totalPoint"] = cntManyCustomer + cntPerCustomer;
			return el;
		})
		
		// 결과 재배열
		rankedList.sort((a, b) => {
			return b['totalPoint'] - a['totalPoint'];
		})

		return rankedList;
	}

	// ======================================================================== 샵 상세조회 ::: GET  /shop/:id
	async getShopInfo(paramId) {
		const { id } = paramId;
		let result;
		let shopInfo;
		let likeInfo;
		let commentInfo;
		
		try {
			// let tmp = await getRepository(Shop)
			// .createQueryBuilder("shop")
			// .leftJoinAndSelect("shop.like", "likeList")
			// .where("shop.id = :id", { id: id })
			// .getOne();

			// 각각 따로따로 조회 중... 리팩토링 필요...
			// await this.shopRepository.findOne({ id }).then(data => {
			// 	shopInfo = data;
			// });
			shopInfo = await getRepository(Shop)
				.createQueryBuilder('shop')
				.where({ id: Number(id) })
				.getOne();
			
			// await this.likeRepository.find({
			// 	select: ["id", "userId", "shopId"],
			// 	where: { shopId: Number(id) }
			// }).then(data => {
			// 	likeInfo = data;
			// });
			likeInfo = await getRepository(Like)
				.createQueryBuilder('like')
				.where({ shopId: Number(id) })
				.getMany();

			// await this.commentRepository.find({
			// 	select: ["id", "userId", "shopId", "comment"],
			// 	where: { shopId: Number(id) }
			// }).then(data => {
			// 	commentInfo = data;
			// });
			commentInfo = await getRepository(Comment)
				.createQueryBuilder('Comment')
				.where({ shopId: Number(id) })
				.getMany();
			
			// result = new SelectOneShopDto();
			result = {
				likeInfo: likeInfo,
				shopInfo: shopInfo,
				commentInfo: commentInfo
			}
		} catch (e) {
			throw e;
		}

		return result;
  }

	// ======================================================================== 카테고리별 샵 목록 ::: GET  /shop/category/:categoryName
	async getShopsByCategory(category) {
		const { categoryName } = category;
		console.log(categoryName)

		let recycleList = await getRepository(Shop)
			.createQueryBuilder('shop')
			.where({ category: categoryName })
			.getMany();

		return recycleList;
	}

	// ======================================================================== 샵 좋아요 ::: POST  /shop/like
	async likeToggle(likeInfo) {
		const { userId, shopId } = likeInfo;


		console.log(userId, shopId);
		// await getRepository(Like)
		// 	.createQueryBuilder('like')
		//   .
		let likeHistory = await getRepository(Like)
			.createQueryBuilder('like')
			.where({ userId, shopId })
			.getOne();

		// 좋아요 기록이 있으면
		// if (likeHistory) {
		// 	await getRepository(Like)
		// 		.createQueryBuilder('like')
		// 		.delete(likeHistory);
		// }
		
		return likeHistory;
	}

	// ======================================================================== 샵 댓글 ::: POST  /shop/comment


	// ======================================================================== 샵 추천 ::: POST  /shop/recommend  :::  랜덤 추천 || 사용자 취향에 따른 추천
	async getShopsByRecommend(userInfo) {
		const { latitude, longitude, userId } = userInfo;
		let result: any = {};
		// 사용자 위치 위도 경도 => 위치 기반 추천 시스템

		// visit 테이블에 사용자가 방문한 이력이 있으면 
		// => 해당 샵의 recommend와 같은 샵을 카테고리별로 2개씩 랜덤으로 추천
		// 방문 이력 없으면 -> 그냥 카테고리별로 2개씩 랜덤으로 추천

		// 사용자가 방문한 이력
		// let userVisit = await getRepository(Visit)
		// 	.createQueryBuilder("visit")
		// 	.leftJoinAndSelect("visit.shop", "shopList")
		// 	// .select(["userId", "shopId", "visitCnt"])
		// 	.where({ userId: userId })
		// 	.getMany();
		
		// if (userVisit.length === 0) {
		// 	console.log('없음!!!!!!!!!!!!!!!!!!!!!!!!!!')
		// } else {
		// }
		// 랜덤 추천
		// let nearShop;
		// let recycleShop;
		// let antiPlasticShop;
		// let antiChemicalShop;

		// 사용자가 좋아요 누름
		// let userLike = await getRepository(Like)
		// 	.createQueryBuilder("like")
		// 	.leftJoinAndSelect("like.shop", "shopList")
		// 	// .select(["userId", "shopId"])
		// 	.where({ userId: userId })
		// 	.getMany();

		// // 사용자가 방문한 샵 정보
		// let visitShopList = userVisit.map(el => {
		// 	delete el.shop.created_at;
		// 	delete el.shop.updated_at;
		// 	return el.shop;
		// });

		// // 사용자가 좋아요 누른 샵 정보
		// let likeShopList = userLike.map(el => {
		// 	delete el.shop.created_at;
		// 	delete el.shop.updated_at;
		// 	return el.shop;
		// });
		
		const entityManager = getManager();
		let nearList;
		await entityManager.query(
			`select *, (6371*acos(cos(radians(${latitude}))*cos(radians(latitude))*cos(radians(longitude)-radians(${longitude}))+sin(radians(${latitude}))*sin(radians(latitude)))) AS distance from shop order by distance asc limit 1;`
			).then(data => {
				nearList = data;
		})

		// 항목별 데이터 조회
		let recycleList = await getRepository(Shop)
			.createQueryBuilder('shop')
			.where({ recommend: 'recycle' })
			.getMany();
		
		let antiPlasticList = await getRepository(Shop)
			.createQueryBuilder('shop')
			.where({ recommend: 'antiPlastic' })
			.getMany();
		
		let antiChemicalList = await getRepository(Shop)
			.createQueryBuilder('shop')
			.where({ recommend: 'antiChemical' })
			.getMany();
		
		// 랜덤한 값들 추출
		let resultRecycle = recycleList[Math.floor(Math.random() * recycleList.length)]
		let resultAntiPlastic = antiPlasticList[Math.floor(Math.random() * antiPlasticList.length)]
		let resultAntiChemical = antiChemicalList[Math.floor(Math.random() * antiChemicalList.length)]

		// result 객체에 담기
		result.nearest = nearList[0];
		result.resultRecycle = resultRecycle;
		result.resultAntiPlastic = resultAntiPlastic;
		result.resultAntiChemical = resultAntiChemical;
		
		// await this.visitRepository.find({
		// 	where: { userId: Number(userId) }
		// })
		// 	.then(data => {
		// 		result = data;
		// })

		// let tmp = await getRepository(User)
		// 	.createQueryBuilder("user")
		// 	.leftJoinAndSelect("user.visit", "visitList")
		// 	.where({ id: Number(userId) })
		// 	.getOne();
		// console.log(tmp)
		// let a = {
		// 	userVisit,
		// 	userLike
		// }
		// return `this is getShopsByRecommend service. Latitude: ${latitude}, Longitude: ${longitude}`;
		// return a;
		// return {visitShopList, likeShopList};
		return result;
	}
}
