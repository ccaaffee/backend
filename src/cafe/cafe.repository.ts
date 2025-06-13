import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCafeDto } from './dto/req/createCafe.dto';
import { UpdateCafeDto } from './dto/req/updateCafe.dto';
import { GetNearCafeListDto } from './dto/req/getNearCafeList.dto';
import { SetCafePreferenceDto } from './dto/req/setCafePreference.dto';
import { GeneralCafeResDto } from './dto/res/generalCafe.dto';
import { GetSwipeCafeListDto } from './dto/req/getSwipeCafeList.dto';
import { PaginationDto } from './dto/req/pagination.dto';

@Injectable()
export class CafeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getCafe(id: number, userUuid?: string): Promise<GeneralCafeResDto> {
    const cafe = await this.prismaService.cafe.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            order: true,
            url: true,
            cafeId: true,
            name: true,
            createdAt: true,
          },
          orderBy: { id: 'asc' },
        },
        openHours: true,
        userCafes: userUuid
          ? {
              where: {
                userUuid,
              },
              select: {
                status: true,
              },
            }
          : undefined,
      },
    });

    if (!cafe) {
      return null;
    }

    const { userCafes, ...cafeWithoutUserCafes } = cafe;
    return {
      ...cafeWithoutUserCafes,
      userPreference: userCafes?.[0]?.status || null,
    };
  }

  async getMyLikeCafeList(
    userUuid: string,
    query: PaginationDto,
  ): Promise<{
    data: GeneralCafeResDto[];
    hasNextPage: boolean;
  }> {
    const page = query.page;
    const take = query.take;

    const skip = (page - 1) * take;
    const limit = take + 1; // +1 to check for the next page

    const rawResult = await this.prismaService.cafe.findMany({
      where: {
        userCafes: {
          some: {
            userUuid,
            status: 'LIKE',
          },
        },
      },
      skip: skip,
      take: limit,
      include: {
        images: {
          select: {
            id: true,
            order: true,
            url: true,
            cafeId: true,
            name: true,
            createdAt: true,
          },
          orderBy: { order: 'asc' },
        },
        openHours: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let hasNextPage = false;
    if (rawResult.length > take) {
      hasNextPage = true;
      rawResult.pop(); // Remove the extra item used to determine if there's a next page
    }

    return {
      data: rawResult,
      hasNextPage,
    };
  }

  async searchCafeByName(
    name: string,
    query: PaginationDto,
    userUuid?: string,
  ): Promise<{
    data: GeneralCafeResDto[];
    hasNextPage: boolean;
  }> {
    const page = query.page;
    const take = query.take;

    const skip = (page - 1) * take;
    const limit = take + 1; // +1 to check for the next page

    const rawResult = await this.prismaService.cafe.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      skip: skip,
      take: limit,
      include: {
        images: {
          select: {
            id: true,
            order: true,
            url: true,
            cafeId: true,
            name: true,
            createdAt: true,
          },
          orderBy: { order: 'asc' },
        },
        openHours: true,
        userCafes: userUuid
          ? {
              where: {
                userUuid,
              },
              select: {
                status: true,
              },
            }
          : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let hasNextPage = false;
    if (rawResult.length > take) {
      hasNextPage = true;
      rawResult.pop();
    }

    const data = rawResult.map(({ userCafes, ...cafe }) => ({
      ...cafe,
      userPreference: userCafes?.[0]?.status || null,
    }));

    return {
      data,
      hasNextPage,
    };
  }

  // image는 null로 처리
  async createCafe(createCafeDto: CreateCafeDto) {
    return await this.prismaService.cafe.create({
      data: {
        ...createCafeDto,
        openHours: {
          create: createCafeDto.openHours,
        },
        images: {},
      },
      include: {
        openHours: true,
      },
    });
  }

  async createCafeWithImages({ images, ...cafeData }: CreateCafeDto) {
    return await this.prismaService.cafe.create({
      data: {
        ...cafeData,
        openHours: {
          create: cafeData.openHours,
        },
        images: {
          create: [
            ...images.map((image, idx) => ({
              order: idx,
              url: image,
              name: cafeData.name,
            })),
          ],
        },
      },
      include: {
        images: {
          select: {
            id: true,
            order: true,
            url: true,
            cafeId: true,
            name: true,
            createdAt: true,
          },
          orderBy: { order: 'asc' },
        },
        openHours: true,
      },
    });
  }

  // 특정 카페에 이미지 생성
  async createCafeImages(id: number, name: string, images: string[]) {
    return await this.prismaService.image.createMany({
      data: [
        ...images.map((image, idx) => ({
          order: idx,
          url: image,
          name: name,
          cafeId: id,
        })),
      ],
    });
  }

  // 카페 정보 업데이트 (이미지는 제외)
  async updateCafe(id: number, updateCafeData: Omit<UpdateCafeDto, 'images'>) {
    const updatedCafe = await this.prismaService.cafe.update({
      where: {
        id: id,
      },
      data: {
        ...updateCafeData,
        openHours: {
          update: updateCafeData.openHours,
        },
      },
      include: {
        images: {
          select: {
            id: true,
            order: true,
            url: true,
            cafeId: true,
            name: true,
            createdAt: true,
          },
          orderBy: { id: 'asc' },
        },
        openHours: true,
      },
    });

    return updatedCafe;
  }

  async deleteCafe(id: number) {
    return await this.prismaService.cafe.delete({
      where: { id },
    });
  }

  async deleteCafeImages(id: number) {
    return await this.prismaService.image.deleteMany({
      where: { cafeId: id },
    });
  }

  // TODO: SPATIAL INDEX 적용
  // TODO: 성능 안나온다 싶으면 MongoDB로 Migration도 고려
  // TODO: 물론, 관련 테스트는 무조건 할 것
  async getNearCafeList(
    query: GetNearCafeListDto,
    userUuid?: string,
  ): Promise<GeneralCafeResDto[]> {
    const cafeList = await this.prismaService.$queryRaw<GeneralCafeResDto[]>`
      SELECT 
        c.id, c.name, c.address, c.latitude, c.longitude, c.instagram, c.naverMap, c.phone, c.createdAt, 
        CASE 
          WHEN COUNT(i.id) = 0 THEN JSON_ARRAY()
          ELSE JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', i.id,
              'order', i.order,
              'url', i.url,
              'name', i.name,
              'createdAt', i.createdAt
            )
          )
        END AS images,
        CASE
          WHEN oh.cafeId IS NULL THEN NULL
          ELSE JSON_OBJECT(
            'monday', oh.monday,
            'tuesday', oh.tuesday,
            'wednesday', oh.wednesday,
            'thursday', oh.thursday,
            'friday', oh.friday,
            'saturday', oh.saturday,
            'sunday', oh.sunday
          )
        END AS openHours,
        MAX(uc.status) as userPreference
      FROM Cafe AS c
        LEFT JOIN Image AS i 
          ON c.id = i.cafeId
        LEFT JOIN UserCafe AS uc
          ON c.id = uc.cafeId
          AND uc.userUuid = ${userUuid || null}
        LEFT JOIN OpenHours AS oh
          ON c.id = oh.cafeId
      WHERE ST_Distance_Sphere(
        point(c.longitude, c.latitude),
          point(${query.longitude}, ${query.latitude})
        ) <= ${query.radiusInMeter}
      GROUP By c.id
    `;

    return cafeList;
  }

  async getUserCafePreference(userUuid: string, cafeId: number) {
    return await this.prismaService.userCafe.findUnique({
      where: { userUuid_cafeId: { userUuid, cafeId } },
      select: {
        status: true,
        updatedAt: true,
      },
    });
  }

  async updateOrCreatePreference(
    userUuid: string,
    cafeId: number,
    setCafePreference: SetCafePreferenceDto,
  ) {
    const preference = await this.getUserCafePreference(userUuid, cafeId);

    if (preference) {
      return await this.prismaService.userCafe.update({
        where: {
          userUuid_cafeId: { userUuid, cafeId },
        },
        data: {
          status: setCafePreference.status,
        },
        select: {
          status: true,
          updatedAt: true,
        },
      });
    }

    return await this.prismaService.userCafe.create({
      data: {
        userUuid,
        cafeId,
        status: setCafePreference.status,
      },
    });
  }

  async getSwipeCafeList(
    userUuid: string,
    query: GetSwipeCafeListDto,
  ): Promise<{ data: GeneralCafeResDto[]; hasNextPage: boolean }> {
    const page = query.page;
    const take = query.take;

    const skip = (page - 1) * take;
    const limit = take + 1; // +1 to check for the next page
    const DISLIKE_EXPIRE_DAYS = 7;

    const rawResult = await this.prismaService.$queryRaw<GeneralCafeResDto[]>`
      SELECT 
        c.id, c.name, c.address, c.latitude, c.longitude, c.instagram, c.naverMap, c.phone, c.createdAt, 
        CASE 
          WHEN COUNT(i.id) = 0 THEN JSON_ARRAY()
          ELSE JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', i.id,
              'order', i.order,
              'url', i.url,
              'name', i.name,
              'createdAt', i.createdAt
            )
          )
        END AS images,
        CASE
          WHEN oh.cafeId IS NULL THEN NULL
          ELSE JSON_OBJECT(
            'monday', oh.monday,
            'tuesday', oh.tuesday,
            'wednesday', oh.wednesday,
            'thursday', oh.thursday,
            'friday', oh.friday,
            'saturday', oh.saturday,
            'sunday', oh.sunday
          )
        END AS openHours,
        uc.status as userPreference
      FROM Cafe AS c
        LEFT JOIN Image AS i 
          ON c.id = i.cafeId
        LEFT JOIN UserCafe AS uc
          ON c.id = uc.cafeId
          AND uc.userUuid = ${userUuid}
        LEFT JOIN OpenHours AS oh
          ON c.id = oh.cafeId
      WHERE ST_Distance_Sphere(
        point(c.longitude, c.latitude),
          point(${query.longitude}, ${query.latitude})
        ) <= ${query.radiusInMeter}
        AND (
          uc.status IS NULL
          OR
          (
            uc.status = 'DISLIKE' 
            AND 
            uc.updatedAt < DATE_SUB(NOW(), INTERVAL ${DISLIKE_EXPIRE_DAYS} DAY))
        )
      GROUP By c.id
      ORDER BY c.id
      LIMIT ${limit} OFFSET ${skip}
    `;

    let hasNextPage = false;
    if (rawResult.length > take) {
      hasNextPage = true;
      rawResult.pop(); // Remove the extra item used to determine if there's a next page
    }

    return {
      data: rawResult,
      hasNextPage,
    };
  }
}
