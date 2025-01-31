import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(kakaoId: string) {
    return this.prismaService.user.create({
      data: {
        kakaoId,
      },
    });
  }

  // kakao id로 유저 찾기
  async findByKakaoId(kakaoId: string) {
    return this.prismaService.user.findUnique({
      where: { kakaoId },
    });
  }

  // DB User table의 uuid로 유저 찾기
  async findByUuid(uuid: string) {
    return this.prismaService.user.findUnique({
      where: { uuid },
    });
  }
}
