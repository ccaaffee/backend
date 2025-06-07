import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { ImageService } from 'src/image/image.service';
import { UserInfo } from 'src/auth/types/userInfo.type';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly imageService: ImageService,
  ) {}

  async createUser(kakaoId: string): Promise<User> {
    return this.userRepository.createUser(kakaoId);
  }

  async findByKakaoId(kakaoId: string): Promise<User | null> {
    return this.userRepository.findByKakaoId(kakaoId);
  }

  async findById(uuid: string): Promise<User | null> {
    return this.userRepository.findByUuid(uuid);
  }

  async formatUserForResponse(user: User): Promise<UserInfo> {
    if (!user) {
      return null;
    }

    const { profileImage, ...userWithoutProfileImage } = user;
    const responseUser: UserInfo = userWithoutProfileImage;

    if (profileImage) {
      responseUser.profileImageUrl =
        await this.imageService.generateSignedUrl(profileImage);
    }

    return responseUser;
  }

  // 닉네임 중복 확인
  async checkNicknameDuplicate(nickname: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByNickname(nickname);
    return !!existingUser;
  }

  // 닉네임 업데이트
  async updateNickname(uuid: string, nickname: string): Promise<User> {
    // 닉네임 중복 확인
    const isDuplicate = await this.checkNicknameDuplicate(nickname);
    if (isDuplicate) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    return this.userRepository.updateNickname(uuid, nickname);
  }

  // 프로필 이미지 업데이트
  async updateProfileImage(
    uuid: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const imageKey = await this.imageService.uploadProfileImage(file);
    return this.userRepository.updateProfileImage(uuid, imageKey);
  }
}
