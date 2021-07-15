import { BadRequestException, Injectable } from '@nestjs/common';
import { Shop } from 'src/models/shop.model';
import { getManager, getRepository } from 'typeorm';
import { Like } from 'src/models/like.model';
import { Comment } from 'src/models/comment.model';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ShopService {
  constructor(private userService: UserService) {}

  // ======================================================================== 랭킹: 샵 ::: GET  /shop/rank
  async getRank() {
    console.log('=== GET  /shop/rank');

    // 샵 목록
    let shopList;
    // 좋아요 횟수에 따른 랭킹으로 sorting
    let rankedList;

    try {
      shopList = await getRepository(Shop)
        .createQueryBuilder('shop')
        .innerJoinAndSelect('shop.like', 'like')
        .select([
          'shop.id',
          'shop.imgPath',
          'shop.name',
          'shop.address',
          'shop.text',
          'shop.latitude',
          'shop.longitude',
          'shop.email',
          'shop.phone',
          'shop.regisNumber',
          'shop.category',
          'shop.recommend',
          'shop.isAdmitted',
          'like.id',
          'like.userId',
          'like.shopId',
        ])
        .take(15)
        .orderBy('like.id', 'DESC')
        .getMany();

      // 각 샵에 좋아요 count 값 입력
      rankedList = shopList.map((el) => {
        return {
          ...el,
          likeLength: el.like.length,
        };
      });

      // 좋아요 count에 따라 sorting
      rankedList.sort((a, b) => {
        return b['likeLength'] - a['likeLength'];
      });
      

    } catch (e) {
      throw e;
    }

    return rankedList.slice(0,9);
  }

  // ======================================================================== 샵 상세조회 ::: GET  /shop/:id
  async getShopInfo(paramId) {
    const { id } = paramId;
    console.log(`=== GET  /shop/${id}`);

    let result; // 결과값
    let shopInfo; // 샵 정보
    let likeComment; // 샵에 대한 좋아요[0], 댓글[1] 정보

    try {
      shopInfo = await getRepository(Shop)
        .createQueryBuilder('shop')
        .select([
          'shop.id',
          'shop.imgPath',
          'shop.name',
          'shop.address',
          'shop.text',
          'shop.latitude',
          'shop.longitude',
          'shop.email',
          'shop.phone',
          'shop.regisNumber',
          'shop.category',
          'shop.recommend',
          'shop.isAdmitted',
        ])
        .where({ id: Number(id) })
        .getOne();

      if (!shopInfo) {
        throw new BadRequestException('조회된 샵이 없습니다.');
      }

      const entityManager = getManager();
      // 좋아요, 댓글 정보 함께 조회
      likeComment = await Promise.all([
        // 좋아요 정보
        getRepository(Like)
          .createQueryBuilder('like')
          .leftJoinAndSelect('like.user', 'user')
          .select([
            'like.id',
            'like.userId',
            'like.shopId',
            'user.id',
            'user.name',
            'user.nick',
            'user.email',
          ])
          .where({ shopId: Number(id) })
          .getMany(),

        // 댓글 정보
        entityManager
          .query(
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
            AND c.userId = u.id
            ORDER BY c.id DESC`,
          )
          .then((data) => {
            return data;
          }),
      ]);

      result = {
        shopInfo: shopInfo,
        likeInfo: likeComment[0],
        commentInfo: likeComment[1],
      };
    } catch (e) {
      throw e;
    }

    return result;
  }

  // ======================================================================== 샵 전체조회 ::: GET  /shop/getAll
  async getAll() {
    console.log(`=== GET  /shop/getAll`);
    let shopList; // 결과값

    try {
      shopList = await getRepository(Shop)
        .createQueryBuilder('shop')
        .select([
          'shop.id',
          'shop.imgPath',
          'shop.name',
          'shop.address',
          'shop.text',
          'shop.latitude',
          'shop.longitude',
          'shop.email',
          'shop.phone',
          'shop.regisNumber',
          'shop.category',
          'shop.recommend',
          'shop.isAdmitted',
        ])
        .where({
          isAdmitted: 1,
        })
        .getMany();
    } catch (e) {
      throw e;
    }

    return shopList;
  }

  // ======================================================================== 카테고리별 샵 목록 ::: GET  /shop/category/:categoryName
  async getShopsByCategory(category) {
    const { categoryName } = category;
    console.log(`=== GET  /shop/category/${categoryName}`);

    let shopList; // 결과값

    try {
      shopList = await getRepository(Shop)
        .createQueryBuilder('shop')
        .select([
          'shop.id',
          'shop.imgPath',
          'shop.name',
          'shop.address',
          'shop.text',
          'shop.latitude',
          'shop.longitude',
          'shop.email',
          'shop.phone',
          'shop.regisNumber',
          'shop.category',
          'shop.recommend',
          'shop.isAdmitted',
        ])
        .where({
          category: categoryName,
          isAdmitted: 1,
        })
        .getMany();

      if (shopList.length === 0) {
        throw new BadRequestException('잘못된 요청입니다.');
      }
    } catch (e) {
      throw e;
    }

    return shopList;
  }

  // ======================================================================== 자주 방문한 샵 목록 ::: GET  /shop/manyVisits/:userId
  async getManyVisits(userInfo) {
    let { userId } = userInfo;
    userId = Number(userId);

    console.log(`=== GET  /shop/manyVisits/${userId}`);

    let visitList = [];
    let arrangedVisitList;

    // 방문 데이터 목록
    visitList = await getRepository(Like)
      .createQueryBuilder('like')
      .innerJoinAndSelect('like.shop', 'shop')
      .select([
        'like.id',
        'like.userId',
        'like.shopId',
        'shop.id',
        'shop.imgPath',
        'shop.name',
        'shop.address',
        'shop.text',
        'shop.latitude',
        'shop.longitude',
        'shop.email',
        'shop.phone',
        'shop.regisNumber',
        'shop.category',
        'shop.recommend',
        'shop.isAdmitted',
      ])
      .where({
        userId: userId,
      })
      .orderBy('like.id', 'DESC')
      .getMany();

    // 방문 수로 sorting
    visitList.sort((a, b) => {
      return b['visitCnt'] - a['visitCnt'];
    });

    // rank 부여
    arrangedVisitList = visitList.map((el, idx) => {
      return {
        ...el,
        rank: idx + 1, // 랭킹 부여
      };
    });

    return arrangedVisitList;
  }

  // ======================================================================== 샵 좋아요 ::: POST  /shop/likeToggle
  async likeToggle(likeInfo) {
    const { userId, shopId } = likeInfo;
    console.log('=== POST  /shop/like');
    console.log(`--- @Body()  userId: ${userId}, shopId: ${shopId}`);

    let likeHistory; // 좋아요 기록

    try {
      likeHistory = await getRepository(Like)
        .createQueryBuilder('like')
        .select(['like.id'])
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
        return '삭제되었습니다.';
      } else {
        // 좋아요 기록이 없으면 추가 처리
        let likeInfo = await getRepository(Like)
          .createQueryBuilder('like')
          .insert()
          .into(Like)
          .values([{ userId, shopId }])
          .updateEntity(false)
          .execute();
        return likeInfo;
      }
    } catch (e) {
      throw e;
    }
  }

  // ======================================================================== 샵 댓글 ::: POST  /shop/comment
  async writeComment(commentInfo) {
    const { userId, shopId, comment } = commentInfo;
    console.log('=== POST  /shop/comment');
    console.log(`--- @Body()  userId: ${userId}, shopId: ${shopId}, comment: ${comment}`);

    let tmpComment; // 입력된 댓글 임시 정보(id만 포함)
    let writtenComment; // 입력된 댓글 전체 정보

    try {
      tmpComment = await getRepository(Comment)
        .createQueryBuilder('comment')
        .insert()
        .into(Comment)
        .values([{ userId, shopId, comment }])
        .updateEntity(false)
        .execute();

      const entityManager = getManager();
      await entityManager
        .query(
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
          limit 1`,
        )
        .then((data) => {
          writtenComment = data[0];
        });
    } catch (e) {
      throw e;
    }

    // 댓글 정보 리턴
    return writtenComment;
  }


  // ======================================================================== 샵 추천 ::: POST  /shop/recommend  :::  랜덤 추천 || 사용자 취향에 따른 추천
  async getShopsByRecommend(userInfo) {
    const { latitude, longitude } = userInfo;
    console.log('=== POST  /shop/recommend');
    console.log(`--- @Body()  latitude: ${latitude}, longitude: ${longitude}`);

    let result: any = {}; // 결과값
    
    const entityManager = getManager();

    let nearRecPlaChe; // nearest[0], recycle[1], antiPlastic[2], antiChemical[3] 데이터

    try {
      nearRecPlaChe = await Promise.all([
        // nearest
        entityManager
          .query(
            `SELECT 
                id,
                imgPath,
                name,
                address,
                text,
                latitude,
                longitude,
                email,
                phone,
                regisNumber,
                category,
                recommend,
                isAdmitted,
                (6371*acos(cos(radians(${latitude}))*cos(radians(latitude))*cos(radians(longitude)-radians(${longitude}))+sin(radians(${latitude}))*sin(radians(latitude)))) AS distance 
            FROM shop
            WHERE isAdmitted = 1
            ORDER BY distance
            ASC LIMIT 1;`,
          )
          .then((data) => data[0]),

        // recycle
        getRepository(Shop)
          .createQueryBuilder('shop')
          .select([
            'shop.id',
            'shop.imgPath',
            'shop.name',
            'shop.address',
            'shop.text',
            'shop.latitude',
            'shop.longitude',
            'shop.email',
            'shop.phone',
            'shop.regisNumber',
            'shop.category',
            'shop.recommend',
            'shop.isAdmitted',
          ])
          .where({
            recommend: 'recycle',
            isAdmitted: 1,
          })
          .getMany(),

        // antiPlastic
        getRepository(Shop)
          .createQueryBuilder('shop')
          .select([
            'shop.id',
            'shop.imgPath',
            'shop.name',
            'shop.address',
            'shop.text',
            'shop.latitude',
            'shop.longitude',
            'shop.email',
            'shop.phone',
            'shop.regisNumber',
            'shop.category',
            'shop.recommend',
            'shop.isAdmitted',
          ])
          .where({
            recommend: 'antiPlastic',
            isAdmitted: 1,
          })
          .getMany(),

        // antiChemical
        getRepository(Shop)
          .createQueryBuilder('shop')
          .select([
            'shop.id',
            'shop.imgPath',
            'shop.name',
            'shop.address',
            'shop.text',
            'shop.latitude',
            'shop.longitude',
            'shop.email',
            'shop.phone',
            'shop.regisNumber',
            'shop.category',
            'shop.recommend',
            'shop.isAdmitted',
          ])
          .where({
            recommend: 'antiChemical',
            isAdmitted: 1,
          })
          .getMany(),
      ]);

      // destructuring
      let [nearest, recycleList, antiPlasticList, antiChemicalList] =
        nearRecPlaChe;

      // 랜덤한 값들 추출
      let resultRecycle =
        recycleList[Math.floor(Math.random() * recycleList.length)];
      let resultAntiPlastic =
        antiPlasticList[Math.floor(Math.random() * antiPlasticList.length)];
      let resultAntiChemical =
        antiChemicalList[Math.floor(Math.random() * antiChemicalList.length)];

      // // result 객체에 담기
      result.nearest = nearest;
      result.resultRecycle = resultRecycle;
      result.resultAntiPlastic = resultAntiPlastic;
      result.resultAntiChemical = resultAntiChemical;
    } catch (e) {
      throw e;
    }

    return result;
  }


  // ======================================================================== 샵 등록 ::: POST  /shop/register
  async registerShop(shopInfo, file) {
    const {
      storeName,
      address,
      marketNum,
      storeEmail,
      category,
      recommend,
      text,
    } = shopInfo;

    console.log('=== POST  /shop/register');
    console.log(`--- @Body()  storeName: ${storeName}, address: ${address}, marketNum: ${marketNum}, storeEmail: ${storeEmail}, category: ${category}, recommend: ${recommend}, text: ${text}`);

    // 이메일 보내기
    this.userService.sendMail(storeEmail, storeName);

    // 추가된 샵
    let insertedShop;

    // 샵 이미지 경로
    const shopImgPath = `${process.env.SERVER_URL}uploads/shops/${file.originalname}`;

    try {
      insertedShop = await getRepository(Shop)
        .createQueryBuilder('shop')
        .insert()
        .into(Shop)
        .values([
          {
            imgPath: shopImgPath,
            name: storeName,
            address: address,
            text: text,
            email: storeEmail,
            regisNumber: marketNum,
            category: category,
            recommend: recommend,
          },
        ])
        .updateEntity(false)
        .execute();
    } catch (e) {
      throw e;
    }

    return insertedShop;
  }
}
