import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    const responseUser: UserInfo = {
      uuid: user.uuid,
      kakaoId: user.kakaoId,
      nickname: user.nickname,
      createdAt: user.createdAt,
      profileImageUrl: null,
    };

    if (user.profileImage) {
      responseUser.profileImageUrl = await this.imageService.generateSignedUrl(
        user.profileImage,
      );
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
    user: User,
    file: Express.Multer.File,
  ): Promise<User> {
    // 기존 프로필 이미지 키를 저장
    const oldProfileImageKey = user.profileImage;

    // 새로운 이미지를 먼저 S3에 업로드
    const newImageKey = await this.imageService.uploadProfileImage(file);

    // DB에 새로운 이미지 키 업데이트
    const updatedUser = await this.userRepository.updateProfileImage(
      user.uuid,
      newImageKey,
    );

    // 새 이미지 업로드와 DB 업데이트가 성공했을 때만 기존 이미지 삭제
    if (oldProfileImageKey) {
      await this.imageService.deleteProfileImage(oldProfileImageKey);
    }

    return updatedUser;
  }

  // 프로필 이미지 삭제
  async deleteProfileImage(user: User): Promise<User> {
    // S3에서 기존 프로필 이미지 삭제
    if (user.profileImage) {
      await this.imageService.deleteProfileImage(user.profileImage);
      // DB에서 User의 프로필 이미지 삭제 (null로 설정)
      return this.userRepository.deleteProfileImage(user.uuid);
    } else {
      throw new NotFoundException('프로필 이미지가 없습니다.');
    }
  }
}
