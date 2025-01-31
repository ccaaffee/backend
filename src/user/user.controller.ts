import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.strategy';
import { GetUser } from './decorator/get-user.decorator';
import { UserInfo } from 'src/auth/types/userInfo.type';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: UserInfo): Promise<UserInfo> {
    console.log(user);
    return user;
  }
}
