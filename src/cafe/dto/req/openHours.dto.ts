import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class OpenHoursDto {
  @ApiProperty({
    type: String,
    description: '카페 월요일 운영 시간',
    example: '09:00-18:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  monday?: string;

  @ApiProperty({
    type: String,
    description: '카페 화요일 운영 시간',
    example: '09:00-18:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  tuesday?: string;

  @ApiProperty({
    type: String,
    description: '카페 수요일 운영 시간',
    example: '09:00-18:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  wednesday?: string;

  @ApiProperty({
    type: String,
    description: '카페 목요일 운영 시간',
    example: '09:00-18:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  thursday?: string;

  @ApiProperty({
    type: String,
    description: '카페 금요일 운영 시간',
    example: '09:00-18:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  friday?: string;

  @ApiProperty({
    type: String,
    description: '카페 토요일 운영 시간',
    example: '09:00-18:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  saturday?: string;

  @ApiProperty({
    type: String,
    description: '카페 일요일 운영 시간',
    example: '09:00-18:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  sunday?: string;
}
