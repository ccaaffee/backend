import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 카카오 로그인 페이지로 리다이렉트
   */
  @Get('kakao')
  async kakaoLogin(@Res() res: Response) {
    const kakaoAuthUrl = this.authService.getKakaoAuthUrl();

    return res.redirect(kakaoAuthUrl);
  }

  /**
   * 카카오 로그인 콜백 처리
   */
  @Get('kakao/callback')
  async kakaoLoginCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      // code를 통해 카카오 서버에서 유저 정보 조회 후 access_token 발급
      const jwtToken = await this.authService.kakaoLogin(code);

      console.log(jwtToken);

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
