import { Injectable } from '@nestjs/common';
import { Shop } from 'src/models/shop.model';
import { getManager, getRepository } from 'typeorm';
import { Like } from 'src/models/like.model';
import { Comment } from 'src/models/comment.model';
import { Visit } from 'src/models/visit.model';

@Injectable()
export class ShopService {

  // constructor(
  //  @InjectRepository(Shop) private shopRepository: Repository<Shop>,
  //  @InjectRepository(Like) private likeRepository: Repository<Like>,
  //  @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  //  @InjectRepository(Visit) private visitRepository: Repository<Visit>
  // ) {
  //  this.shopRepository = shopRepository;
  //  this.likeRepository = likeRepository;
  //  this.commentRepository = commentRepository;
  //  this.visitRepository = visitRepository;
  // }

  // ======================================================================== 랭킹: 샵 ::: GET  /shop/rank
  async getRank() {
    console.log('=== GET  /shop/rank');
    
    // 사용자 방문 횟수에 따른 랭킹
    let shopList = await getRepository(Shop)
      .createQueryBuilder("shop")
      .leftJoinAndSelect("shop.visit", "visit")
      .leftJoinAndSelect("shop.like", "like")
      .select([
        'shop.id',
        'shop.name',
        'shop.address',
        'shop.latitude',
        'shop.longitude',
        'shop.category',
        'shop.recommend',
        'shop.phone',
        'visit.id',
        'visit.userId',
        'visit.shopId',
        'visit.visitCnt',
        'like.id',
        'like.userId',
        'like.shopId'
      ])
      .orderBy('visit.visitCnt', 'DESC')
      // .limit(8)
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
    console.log(`=== GET  /shop/${id}`);
    let result;
    let shopInfo;
    let likeComment;
    
    try {
      // 샵 정보
      shopInfo = await getRepository(Shop)
        .createQueryBuilder('shop')
        .select([
          'shop.id',
          'shop.name',
          'shop.address',
          'shop.latitude',
          'shop.longitude',
          'shop.category',
          'shop.recommend',
          'shop.phone'
        ])
        .where({ id: Number(id) })
        .getOne();

      const entityManager = getManager();
      // 좋아요, 댓글 정보 함께 조회
      likeComment = await Promise.all([
        // 좋아요 정보
        getRepository(Like)
          .createQueryBuilder('like')
          .leftJoinAndSelect("like.user", "user")
          .select([
            'like.id',
            'like.userId',
            'like.shopId',
            'user.id',
            'user.name',
            'user.nick',
            'user.email'
          ])
          .where({ shopId: Number(id) })
          .getMany(),
        
        // 댓글 정보
        entityManager.query(
          `SELECT
              c.id,
              c.userId,
              c.shopId,
              c.comment,
              c.created_at,
              c.updated_at,
              u.email,
              u.name,
              u.nick
          FROM
              comment AS c,
              user AS u
          WHERE c.shopId = ${Number(id)} 
          AND c.userId = u.id`
        ).then(data => {
          return data;
        })
      ])

      result = {
        shopInfo: shopInfo,
        likeInfo: likeComment[0],
        commentInfo: likeComment[1]
      }
    } catch (e) {
      throw e;
    }

    return result;
  }
  
  
  async getAll() {
    console.log(`=== GET  /shop/getAll`);

    const shopList = await getRepository(Shop)
      .createQueryBuilder('shop')
      .select([
        'shop.id',
        'shop.name',
        'shop.address',
        'shop.latitude',
        'shop.longitude',
        'shop.category',
        'shop.recommend',
        'shop.phone'
      ])
      .getMany();
    
    
    // const arrangedShopList = {
    //   cafe: [],
    //   life: [],
    //   organ: []
    // };
    
    // for (let el of shopList) {
    //   switch (el['category']) {
    //     case 'cafe':
    //       arrangedShopList['cafe'].push(el);
    //       break;
        
    //     case 'life':
    //       arrangedShopList['life'].push(el);
    //       break;
        
    //     case 'organ':
    //       arrangedShopList['organ'].push(el);
    //       break;
    //   }
    // }

    return shopList;
  }


  // ======================================================================== 카테고리별 샵 목록 ::: GET  /shop/category/:categoryName
  async getShopsByCategory(category) {
    const { categoryName } = category;
    console.log(`=== GET  /shop/category/${categoryName}`);

    let recycleList = await getRepository(Shop)
      .createQueryBuilder('shop')
      .select([
        'shop.id',
        'shop.name',
        'shop.address',
        'shop.latitude',
        'shop.longitude',
        'shop.category',
        'shop.recommend',
        'shop.phone'
      ])
      .where({ category: categoryName })
      .getMany();

    return recycleList;
  }

  // ======================================================================== 자주 방문한 샵 목록 ::: GET  /shop/manyVisits/:userId
  async getManyVisits(userInfo) {
    let { userId } = userInfo;
    userId = Number(userId);
    console.log(`=== GET  /shop/manyVisits/${userId}`);
    
    let visitList = await getRepository(Visit)
      .createQueryBuilder('visit')
      .innerJoinAndSelect("visit.shop", "shop")
      .select([
        'visit.id',
        'visit.userId',
        'visit.shopId',
        'visit.visitCnt',
        'shop.id',
        'shop.name',
        'shop.address',
        'shop.latitude',
        'shop.longitude',
        'shop.category',
        'shop.recommend',
        'shop.phone'
      ])
      .where({ userId: userId })
      .getMany();
    
    visitList.sort((a, b) => {
      return b['visitCnt'] - a['visitCnt'];
    })

    return visitList;
  }

  // ======================================================================== 샵 좋아요 ::: POST  /shop/like
  async likeToggle(likeInfo) {
    const { userId, shopId } = likeInfo;
    console.log('=== POST  /shop/like');
    console.log(`=== @Body()  ${userId}, ${shopId}`);

    let likeHistory = await getRepository(Like)
      .createQueryBuilder('like')
      .select([
        'like.id'
      ])
      .where({ userId, shopId })
      .getOne();
    
    // 좋아요 기록이 있으면 삭제 처리
    if (likeHistory) {
      await getRepository(Like)
        .createQueryBuilder('like')
        .delete()
        .from(Like)
        .where({ id: likeHistory.id })
        .execute();
      return '삭제되었습니다.'
    } else {
      // 좋아요 기록이 없으면 추가 처리
      let likeInfo = await getRepository(Like)
        .createQueryBuilder('like')
        .insert()
        .into(Like)
        .values([
          { userId, shopId }
        ])
        .updateEntity(false)
        .execute();
      return likeInfo;
    }
  }

  // ======================================================================== 샵 댓글 ::: POST  /shop/comment
  async writeComment(commentInfo) {
    const { userId, shopId, comment } = commentInfo;
    console.log('=== POST  /shop/comment');
    console.log(`=== @Body()  ${userId}, ${shopId}, ${comment}`);

    // 댓글 입력
    const tmpComment = await getRepository(Comment)
      .createQueryBuilder('comment')
      .insert()
      .into(Comment)
      .values([
        { userId, shopId, comment }
      ])
      .updateEntity(false)
      .execute();
    
    
    const entityManager = getManager();
    let writtenComment;
    await entityManager.query(
      `SELECT
          c.id,
          c.userId,
          c.shopId,
          c.comment,
          c.created_at,
          c.updated_at,
          u.email,
          u.name,
          u.nick
      FROM
          comment AS c,
          user AS u
      WHERE c.id = ${tmpComment.raw.insertId} 
      AND c.userId = u.id
      limit 1`
      ).then(data => {
        writtenComment = data[0];
      })
    
    // 댓글 정보 리턴
    return writtenComment;
  }


  // ======================================================================== 샵 추천 ::: POST  /shop/recommend  :::  랜덤 추천 || 사용자 취향에 따른 추천
  async getShopsByRecommend(userInfo) {
    const { latitude, longitude, userId } = userInfo;
    console.log('=== POST  /shop/recommend ');
    console.log(`=== @Body()  ${latitude}, ${longitude}, ${userId}`);
    let result: any = {};
    // 사용자 위치 위도 경도 => 위치 기반 추천 시스템

    // visit 테이블에 사용자가 방문한 이력이 있으면 
    // => 해당 샵의 recommend와 같은 샵을 카테고리별로 2개씩 랜덤으로 추천
    // 방문 이력 없으면 -> 그냥 카테고리별로 2개씩 랜덤으로 추천

    // 사용자가 방문한 이력
    // let userVisit = await getRepository(Visit)
    //  .createQueryBuilder("visit")
    //  .leftJoinAndSelect("visit.shop", "shopList")
    //  // .select(["userId", "shopId", "visitCnt"])
    //  .where({ userId: userId })
    //  .getMany();
    
    // if (userVisit.length === 0) {
    //  console.log('없음!!!!!!!!!!!!!!!!!!!!!!!!!!')
    // } else {
    // }
    // 랜덤 추천
    // let nearShop;
    // let recycleShop;
    // let antiPlasticShop;
    // let antiChemicalShop;

    // 사용자가 좋아요 누름
    // let userLike = await getRepository(Like)
    //  .createQueryBuilder("like")
    //  .leftJoinAndSelect("like.shop", "shopList")
    //  // .select(["userId", "shopId"])
    //  .where({ userId: userId })
    //  .getMany();

    // // 사용자가 방문한 샵 정보
    // let visitShopList = userVisit.map(el => {
    //  delete el.shop.created_at;
    //  delete el.shop.updated_at;
    //  return el.shop;
    // });

    // // 사용자가 좋아요 누른 샵 정보
    // let likeShopList = userLike.map(el => {
    //  delete el.shop.created_at;
    //  delete el.shop.updated_at;
    //  return el.shop;
    // });
    

    const entityManager = getManager();
    let nearList;
    await entityManager.query(
      `SELECT 
          id,
          name,
          address,
          latitude,
          longitude,
          category,
          recommend,
          phone,
          (6371*acos(cos(radians(${latitude}))*cos(radians(latitude))*cos(radians(longitude)-radians(${longitude}))+sin(radians(${latitude}))*sin(radians(latitude)))) AS distance 
      FROM shop
      ORDER BY distance
      ASC LIMIT 1;`
      ).then(data => {
        nearList = data;
      })
    
    let recPlaChe = await Promise.all([
      // recycle
      getRepository(Shop)
      .createQueryBuilder('shop')
        .select([
          'shop.id',
          'shop.name',
          'shop.address',
          'shop.latitude',
          'shop.longitude',
          'shop.category',
          'shop.recommend',
          'shop.phone'
        ])
      .where({ recommend: 'recycle' })
        .getMany(),
      
      // antiPlastic
      getRepository(Shop)
      .createQueryBuilder('shop')
        .select([
          'shop.id',
          'shop.name',
          'shop.address',
          'shop.latitude',
          'shop.longitude',
          'shop.category',
          'shop.recommend',
          'shop.phone'
        ])
      .where({ recommend: 'antiPlastic' })
        .getMany(),
      
      // antiChemical
      getRepository(Shop)
      .createQueryBuilder('shop')
        .select([
          'shop.id',
          'shop.name',
          'shop.address',
          'shop.latitude',
          'shop.longitude',
          'shop.category',
          'shop.recommend',
          'shop.phone'
        ])
      .where({ recommend: 'antiChemical' })
      .getMany()
    ])

    // destructuring
    const [recycleList, antiPlasticList, antiChemicalList] = recPlaChe;
    
    // 랜덤한 값들 추출
    let resultRecycle = recycleList[Math.floor(Math.random() * recycleList.length)]
    let resultAntiPlastic = antiPlasticList[Math.floor(Math.random() * antiPlasticList.length)]
    let resultAntiChemical = antiChemicalList[Math.floor(Math.random() * antiChemicalList.length)]

    // // result 객체에 담기
    result.nearest = nearList[0];
    result.resultRecycle = resultRecycle;
    result.resultAntiPlastic = resultAntiPlastic;
    result.resultAntiChemical = resultAntiChemical;
    
    // await this.visitRepository.find({
    //  where: { userId: Number(userId) }
    // })
    //  .then(data => {
    //    result = data;
    // })

    // let tmp = await getRepository(User)
    //  .createQueryBuilder("user")
    //  .leftJoinAndSelect("user.visit", "visitList")
    //  .where({ id: Number(userId) })
    //  .getOne();
    // console.log(tmp)
    // let a = {
    //  userVisit,
    //  userLike
    // }
    // return `this is getShopsByRecommend service. Latitude: ${latitude}, Longitude: ${longitude}`;
    // return a;
    // return {visitShopList, likeShopList};
    return result;
  } 
}

