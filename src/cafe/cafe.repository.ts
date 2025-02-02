import { Injectable } from '@nestjs/common';
import { Cafe } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCafeDto } from './dto/req/createCafe.dto';
import { UpdateCafeDto } from './dto/req/updateCafe.dto';
import { GetNearCafeListDto } from './dto/req/getNearCafeList.dto';
import { GeneralCafeDto } from './dto/res/generalCafe.dto';
import { SetCafePreferenceDto } from './dto/req/setCafePreference.dto';

@Injectable()
export class CafeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getCafe(id: number): Promise<Cafe> {
    return await this.prismaService.cafe.findUnique({
      where: { id },
    });
  }

  async createCafe(createCafeDto: CreateCafeDto) {
    return await this.prismaService.cafe.create({
      data: { ...createCafeDto },
    });
  }

  async updateCafe(id: number, updateCafeDto: UpdateCafeDto) {
    return await this.prismaService.cafe.update({
      where: {
        id: id,
      },
      data: {
        ...updateCafeDto,
      },
    });
  }

  async deleteCafe(id: number) {
    return await this.prismaService.cafe.delete({
      where: { id },
    });
  }

  // TODO: SPATIAL INDEX 적용
  // TODO: 성능 안나온다 싶으면 MongoDB로 Migration도 고려
  // TODO: 물론, 관련 테스트는 무조건 할 것
  async getNearCafeList(query: GetNearCafeListDto): Promise<GeneralCafeDto[]> {
    console.time('getNearCafeList');

    const result = await this.prismaService.$queryRaw<GeneralCafeDto[]>`
      SELECT id, name, address, latitude, longitude, instagram, phone, createdAt 
      FROM Cafe
      WHERE ST_Distance_Sphere(
        point(longitude, latitude),
        point(${query.longitude}, ${query.latitude})
      ) <= ${query.radiusInMeter}
    `;
    console.log(result.length);

    console.timeEnd('getNearCafeList');

    return result;
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
}
