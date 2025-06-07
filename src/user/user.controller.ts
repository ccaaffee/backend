import { Controller, Get, UseGuards, Body, Patch, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.strategy';
import { GetUser } from './decorator/get-user.decorator';
import { UserInfo } from 'src/auth/types/userInfo.type';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserInfoDto } from './dto/res/userInfo.dto';
import { UpdateNicknameDto } from './dto/req/updateNickname.dto';
import { NicknameDuplicateCheckDto } from './dto/res/nicknameDuplicateCheck.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'get my profile',
  })
  @ApiOkResponse({
    type: UserInfoDto,
    description: 'Return my profile',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: UserInfo): Promise<UserInfo> {
    return user;
  }

  @ApiOperation({
    summary: 'check nickname duplicate',
  })
  @ApiQuery({
    name: 'nickname',
    type: String,
    description: 'Nickname to check',
    required: true,
  })
  @ApiOkResponse({
    type: NicknameDuplicateCheckDto,
    description: 'Return whether nickname is duplicate or not',
  })
  @Get('nickname/check')
  async checkNicknameDuplicate(
    @Query('nickname') nickname: string,
  ): Promise<NicknameDuplicateCheckDto> {
    const isDuplicate = await this.userService.checkNicknameDuplicate(nickname);
    return { isDuplicate };
  }

  @ApiOperation({
    summary: 'update my nickname',
  })
  @ApiOkResponse({
    type: UserInfoDto,
    description: 'Return updated profile',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Patch('nickname')
  @UseGuards(JwtAuthGuard)
  async updateNickname(
    @GetUser() user: UserInfo,
    @Body() updateNicknameDto: UpdateNicknameDto,
  ): Promise<UserInfo> {
    return this.userService.updateNickname(
      user.uuid,
      updateNicknameDto.nickname,
    );
  }
}
