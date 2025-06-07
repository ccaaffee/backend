import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(kakaoId: string) {
    return this.userRepository.createUser(kakaoId);
  }

  async findByKakaoId(kakaoId: string) {
    return this.userRepository.findByKakaoId(kakaoId);
  }

  async findById(uuid: string) {
    return this.userRepository.findByUuid(uuid);
  }

  // 닉네임 중복 확인
  async checkNicknameDuplicate(nickname: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByNickname(nickname);
    return !!existingUser;
  }

  // 닉네임 업데이트
  async updateNickname(uuid: string, nickname: string) {
    // 닉네임 중복 확인
    const isDuplicate = await this.checkNicknameDuplicate(nickname);
    if (isDuplicate) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    return this.userRepository.updateNickname(uuid, nickname);
  }
}
