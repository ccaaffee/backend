import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly kakaoRestApiKey: string;
  private readonly kakaoRedirectUri: string;
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.kakaoRestApiKey = this.configService.get<string>('KAKAO_REST_API_KEY');
    this.kakaoRedirectUri =
      this.configService.get<string>('KAKAO_REDIRECT_URI');
  }

  /**
   * 카카오 로그인 URL 생성
   */
  getKakaoAuthUrl(): string {
    const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
    const queryParams = new URLSearchParams({
      client_id: this.kakaoRestApiKey,
      redirect_uri: this.kakaoRedirectUri,
      response_type: 'code',
    }).toString();

    return `${baseUrl}?${queryParams}`;
  }

  /**
   * 카카오 토큰 발급 후 유저 정보 획득 및 로그인 처리
   */
  async kakaoLogin(code: string): Promise<string> {
    console.log(code);
    const tokenReponse = await this.getKakaoToken(code);
    console.log(tokenReponse);
    const accessToken = tokenReponse.access_token;

    // 2) 발급한 access token으로 유저정보 요청 to 카카오 로그인 서버
    const kakaoUserInfo = await this.getKakaoUserInfo(accessToken);
    console.log(kakaoUserInfo);

    // 3) DB에 해당 유저가 존재하는지 확인 및 생성
    const kakaoId = kakaoUserInfo.id.toString();

    let user = await this.userService.findByKakaoId(kakaoId);

    if (!user) {
      console.log(123131);
      user = await this.userService.createUser(kakaoId);
    }

    console.log(user);

    // 4) JWT 발급
    const payload = { sub: user.uuid };
    const jwtToken = this.jwtService.sign(payload);

    return jwtToken;
  }

  /**
   * 카카오 Access Token 발급
   */
  private async getKakaoToken(code: string) {
    const url = 'https://kauth.kakao.com/oauth/token';

    try {
      const response = await axios.post(
        url,
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.kakaoRestApiKey,
          redirect_uri: this.kakaoRedirectUri,
          code,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      return response.data; // { access_token, token_type, refresh_token, ... }
    } catch (error) {
      throw new UnauthorizedException(`Kakao Access Token 발급 실패: ${error}`);
    }
  }

  /**
   * 카카오 사용자 정보 조회
   */
  private async getKakaoUserInfo(accessToken: string) {
    const url = 'https://kapi.kakao.com/v2/user/me';
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      return response.data;
    } catch (error) {
      throw new UnauthorizedException(`Kakao 사용자 정보 조회 실패: ${error}`);
    }
  }
}
