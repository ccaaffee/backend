import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private async generateUniqueNickname(): Promise<string> {
    const totalUsers = await this.prismaService.user.count();
    const newUserNumber = totalUsers + 1;
    return `사용자${newUserNumber}`;
  }

  async createUser(kakaoId: string) {
    const nickname = await this.generateUniqueNickname();
    return this.prismaService.user.create({
      data: {
        kakaoId,
        nickname,
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

  // 닉네임으로 유저 찾기
  async findByNickname(nickname: string) {
    return this.prismaService.user.findUnique({
      where: { nickname },
    });
  }

  // 닉네임 업데이트
  async updateNickname(uuid: string, nickname: string) {
    return this.prismaService.user.update({
      where: { uuid },
      data: { nickname },
    });
  }

  // 프로필 이미지 업데이트
  async updateProfileImage(uuid: string, profileImage: string) {
    return this.prismaService.user.update({
      where: { uuid },
      data: { profileImage },
    });
  }
}
