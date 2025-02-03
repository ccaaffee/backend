import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'kakao login with accessToken from front',
    description:
      '(only for staging server)kakao accessToken을 입력하면 cafe-search 서비스의 accessToken을 반환합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'Kakao access token',
          example: 'your-kakao-access-token',
        },
      },
    },
  })
  @Post('kakao/signin')
  async kakaoLoginWithAccessToken(
    @Body('accessToken') accessToken: string,
    @Res() res: Response,
  ) {
    try {
      const jwtToken =
        await this.authService.kakaoLoginWithAccessToken(accessToken);

      return res.status(HttpStatus.OK).json({
        message: 'Kakao Login Success',
        token: jwtToken,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Kakao Login Failed',
        error: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'redirect to kakao login page',
    description: 'API 요청 시 카카오 로그인 페이지로 리다이렉트됩니다.',
  })
  @Get('kakao/login')
  async getKakaoLoginUri(@Res() res: Response) {
    const kakaoAuthUrl = this.authService.getKakaoAuthUrl();

    return res.redirect(kakaoAuthUrl);
  }

  @ApiOperation({
    summary: 'callback api for kakao login',
    description:
      '(only for staging server)kakao login page에 로그인 후 받은 authorization code와 함께 API 요청 시 access_token을 반환합니다.',
  })
  @Get('kakao/callback')
  async kakaoLoginCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      // code를 통해 카카오 서버에서 유저 정보 조회 후 access_token 발급
      const jwtToken = await this.authService.kakaoLogin(code);

      return res.status(HttpStatus.OK).json({
        message: 'Kakao Login Success',
        token: jwtToken,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Kakao Login Failed',
        error: error.message,
      });
    }
  }
}
