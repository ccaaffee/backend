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
import { PaginationCafeListResDto } from './dto/res/paginationCafeListRes.dto';
import { GetSwipeCafeListDto } from './dto/req/getSwipeCafeList.dto';
import { ImageService } from 'src/image/image.service';
import { PaginationDto } from './dto/req/pagination.dto';

@Injectable()
export class CafeService {
  constructor(
    private readonly cafeRepository: CafeRepository,
    private readonly imageService: ImageService,
  ) {}

  async getCafe(id: number, userUuid: string) {
    const cafe = await this.cafeRepository.getCafe(id, userUuid);

    if (!cafe) {
      throw new NotFoundException('Cafe not found');
    }

    return await this.applyS3SignedUrlForCafe(cafe);
  }

  async getMyLikeCafeList(
    userUuid: string,
    query: PaginationDto,
  ): Promise<PaginationCafeListResDto> {
    const { data, hasNextPage } = await this.cafeRepository.getMyLikeCafeList(
      userUuid,
      query,
    );

    const cafeList = await this.applyS3SignedUrlsForCafeList(data);

    const result: PaginationCafeListResDto = {
      data: cafeList,
      nextPage: hasNextPage ? query.page + 1 : null,
      cafeCount: data.length,
      hasNextPage,
    };

    return result;
  }

  async searchCafeByName(name: string, query: PaginationDto, userUuid: string) {
    const { data, hasNextPage } = await this.cafeRepository.searchCafeByName(
      name,
      query,
      userUuid,
    );

    const cafeList = await this.applyS3SignedUrlsForCafeList(data);

    const result: PaginationCafeListResDto = {
      data: cafeList,
      nextPage: hasNextPage ? query.page + 1 : null,
      cafeCount: data.length,
      hasNextPage,
    };

    return result;
  }

  async getNearCafeList(
    query: GetNearCafeListDto,
    userUuid: string,
  ): Promise<GeneralCafeResDto[]> {
    // 한국 내부 좌표인지 확인
    if (!this.isValidKoreanGPS(query.latitude, query.longitude)) {
      throw new BadRequestException(
        'Wrong GPS coordinates (out of South Korea)',
      );
    }

    const cafeList = await this.cafeRepository.getNearCafeList(query, userUuid);

    return await this.applyS3SignedUrlsForCafeList(cafeList);
  }

  async createCafe(createCafeDto: CreateCafeDto) {
    // 일반 게시물 생성하듯이 하면 안됨 -> 중복 업로드 방지 과정이 필요함

    let cafe;

    // Case 1: Including Images
    if (createCafeDto.images?.length) {
      // Image Validation by Key
      await this.imageService.validateImages(createCafeDto.images);

      cafe = await this.cafeRepository.createCafeWithImages(createCafeDto);
    } else {
      // Case 2: Not including Image
      cafe = await this.cafeRepository.createCafe(createCafeDto);
    }

    return await this.applyS3SignedUrlForCafe(cafe);
  }

  async updateCafe(id: number, { images, ...updateCafeDto }: UpdateCafeDto) {
    const oldCafe = await this.cafeRepository.getCafe(id);

    if (!oldCafe) {
      throw new NotFoundException('Cafe not found');
    }

    let cafe = oldCafe;

    if (updateCafeDto) {
      cafe = await this.cafeRepository.updateCafe(id, updateCafeDto);
    }

    if (images) {
      // delete original cafe images
      await this.imageService.validateImages(images);
      await this.cafeRepository.deleteCafeImages(id);
      await this.cafeRepository.createCafeImages(id, cafe.name, images);

      cafe = await this.cafeRepository.getCafe(id);
    }

    return await this.applyS3SignedUrlForCafe(cafe);
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

  async deleteCafePreference(userUuid: string, cafeId: number) {
    const cafe = await this.cafeRepository.getCafe(cafeId);
    if (!cafe) {
      throw new NotFoundException('Cafe not found');
    }

    const preference = await this.cafeRepository.getUserCafePreference(
      userUuid,
      cafeId,
    );
    if (!preference) {
      throw new NotFoundException('Preference not found');
    }

    await this.cafeRepository.deleteUserCafePreference(userUuid, cafeId);
  }

  async getSwipeCafeList(
    user: User,
    query: GetSwipeCafeListDto,
  ): Promise<PaginationCafeListResDto> {
    // GPS coordinates Validation
    if (!this.isValidKoreanGPS(query.latitude, query.longitude)) {
      throw new BadRequestException(
        'Wrong GPS coordinates (out of South Korea)',
      );
    }

    // Pagination values Validation
    if (query.page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    if (query.take < 1 || query.take > 20) {
      throw new BadRequestException('Take must be between 1 and 20');
    }

    const { data, hasNextPage } = await this.cafeRepository.getSwipeCafeList(
      user.uuid,
      query,
    );

    const cafeList = await this.applyS3SignedUrlsForCafeList(data);

    const result: PaginationCafeListResDto = {
      data: cafeList,
      nextPage: hasNextPage ? query.page + 1 : null,
      cafeCount: data.length,
      hasNextPage,
    };

    return result;
  }

  // Cafe List를 return하기 전, images의 url을 signed urls로 변경
  async applyS3SignedUrlsForCafeList(
    cafeList: GeneralCafeResDto[],
  ): Promise<GeneralCafeResDto[]> {
    const signedCageList = await Promise.all(
      cafeList.map(async (cafe) => {
        return await this.applyS3SignedUrlForCafe(cafe);
      }),
    );

    return signedCageList;
  }

  // Cafe를 return하기 전, images의 url을 signed urls로 변경
  async applyS3SignedUrlForCafe(
    cafe: GeneralCafeResDto,
  ): Promise<GeneralCafeResDto> {
    if (!cafe.images) {
      return cafe;
    }

    const signedImages = await Promise.all(
      cafe.images.map(async (image) => {
        const signedUrl = await this.imageService.generateSignedUrl(image.url);

        return {
          ...image,
          url: signedUrl,
        };
      }),
    );

    return {
      ...cafe,
      images: signedImages,
    };
  }
}
