import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCafeDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Cafe name',
    example: '카페 드 발렌느',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    description: "Cafe's address",
    example: '서울 관악구 신림로67길 23 1층 102호',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    type: Number,
    description: "Cafe's Latitude",
    example: 37.485772,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    type: Number,
    description: "Cafe's Longitude",
    example: 126.927983,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({
    type: String,
    description: "Cafe's Instgram Link",
    example: 'https://www.instagram.com/cafe_baleine',
  })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({
    type: String,
    description: "Cafe's Phone number",
    example: '02-1234-5678',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
