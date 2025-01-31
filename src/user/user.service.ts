import { Injectable } from '@nestjs/common';
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
}
