import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({
    type: String,
    description: "User's uuid",
    example: '09d1f076-c889-4493-82dd-c8c7de2abe08',
  })
  uuid: string;

  @ApiProperty({
    type: String,
    description: "User's Kakao ID",
    example: '2454123030',
  })
  kakaoId: string;

  @ApiProperty({
    type: Date,
    description: 'Account created Date',
    example: '2025-01-30T15:34:28.284Z',
  })
  createdAt: Date;
}
