import {
  Controller,
  Get,
  UseGuards,
  Body,
  Patch,
  Query,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.strategy';
import { GetUser } from './decorator/get-user.decorator';
import { UserInfo } from 'src/auth/types/userInfo.type';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';

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
  async getProfile(@GetUser() user: User): Promise<UserInfo> {
    return this.userService.formatUserForResponse(user);
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
  @Get('profile/nickname/check')
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
  @Patch('profile/nickname')
  @UseGuards(JwtAuthGuard)
  async updateNickname(
    @GetUser() user: User,
    @Body() updateNicknameDto: UpdateNicknameDto,
  ): Promise<UserInfo> {
    const updatedUser = await this.userService.updateNickname(
      user.uuid,
      updateNicknameDto.nickname,
    );
    return this.userService.formatUserForResponse(updatedUser);
  }

  @ApiOperation({
    summary: 'upload profile image',
    description:
      '프로필 이미지를 업로드합니다. 이미지는 1:1 비율로 자동 크롭됩니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '프로필 이미지 파일 (jpg, jpeg, png만 가능)',
        },
      },
    },
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
  @Post('profile/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png)$/)) {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfileImage(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserInfo> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const updatedUser = await this.userService.updateProfileImage(
      user.uuid,
      file,
    );
    return this.userService.formatUserForResponse(updatedUser);
  }
}
