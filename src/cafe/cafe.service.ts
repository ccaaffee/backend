import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CafeRepository } from './cafe.repository';
import { CreateCafeDto } from './dto/req/createCafe.dto';
import { UpdateCafeDto } from './dto/req/updateCafe.dto';
import { GetNearCafeListDto } from './dto/req/getNearCafeList.dto';
import { GeneralCafeResDto } from './dto/res/generalCafe.dto';
import { SetCafePreferenceDto } from './dto/req/setCafePreference.dto';
import { User } from '@prisma/client';
import { SwipeCafeListResDto } from './dto/res/switeCafeListRes.dto';
import { GetSwipeCafeListDto } from './dto/req/getSwipeCafeList.dto';

@Injectable()
export class CafeService {
  constructor(private readonly cafeRepository: CafeRepository) {}

  async getCafe(id: number) {
    const cafe = await this.cafeRepository.getCafe(id);

    if (!cafe) {
      throw new NotFoundException('Cafe not found');
    }

    return cafe;
  }

  async getNearCafeList(
    query: GetNearCafeListDto,
  ): Promise<GeneralCafeResDto[]> {
    // 한국 내부 좌표인지 확인
    if (!this.isValidKoreanGPS(query.latitude, query.longitude)) {
      throw new BadRequestException(
        'Wrong GPS coordinates (out of South Korea)',
      );
    }

    return await this.cafeRepository.getNearCafeList(query);
  }

  async createCafe(createCafeDto: CreateCafeDto) {
    // 일반 게시물 생성하듯이 하면 안됨 -> 중복 업로드 방지 과정이 필요함

    return await this.cafeRepository.createCafe(createCafeDto);
  }

  async updateCafe(id: number, updateCafeDto: UpdateCafeDto) {
    const cafe = await this.cafeRepository.getCafe(id);

    if (!cafe) {
      throw new NotFoundException('Cafe not found');
    }

    return await this.cafeRepository.updateCafe(id, updateCafeDto);
  }

  async deleteCafe(id: number) {
    const cafe = await this.cafeRepository.getCafe(id);

    if (!cafe) {
      throw new NotFoundException('Cafe not found');
    }

    return await this.cafeRepository.deleteCafe(id);
  }

  private isValidKoreanGPS(latitude: number, longitude: number): boolean {
    return (
      latitude >= 33.0 &&
      latitude <= 38.7 &&
      longitude >= 124.6 &&
      longitude <= 131.9
    );
  }

  async getCafePreference(userUuid: string, cafeId: number) {
    const cafe = await this.cafeRepository.getCafe(cafeId);
    if (!cafe) {
      throw new NotFoundException('Cafe not found');
    }

    return await this.cafeRepository.getUserCafePreference(userUuid, cafeId);
  }

  async setCafePreference(
    userUuid: string,
    cafeId: number,
    setCafePreferenceDto: SetCafePreferenceDto,
  ) {
    const cafe = await this.cafeRepository.getCafe(cafeId);
    if (!cafe) {
      throw new NotFoundException('Cafe not found');
    }

    const preference = await this.cafeRepository.updateOrCreatePreference(
      userUuid,
      cafeId,
      setCafePreferenceDto,
    );

    return preference;
  }

  async getSwipeCafeList(
    user: User,
    query: GetSwipeCafeListDto,
    page = 1,
    take = 20,
  ): Promise<SwipeCafeListResDto> {
    if (!this.isValidKoreanGPS(query.latitude, query.longitude)) {
      throw new BadRequestException(
        'Wrong GPS coordinates (out of South Korea)',
      );
    }

    const { data, hasNextPage } = await this.cafeRepository.getSwipeCafeList(
      user.uuid,
      query,
      page,
      take,
    );

    const result: SwipeCafeListResDto = {
      data,
      nextPage: page + 1,
      cafeCount: data.length,
      hasNextPage,
    };

    return result;
  }
}
