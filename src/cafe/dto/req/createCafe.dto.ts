import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCafeDto {
  @ApiProperty({
    type: String,
    description: 'Cafe name',
    example: '카페 드 발렌느',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: "Cafe's address",
    example: '서울 관악구 신림로67길 23 1층 102호',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    type: Number,
    description: "Cafe's Latitude",
    example: 37.485772,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    type: Number,
    description: "Cafe's Longitude",
    example: 126.927983,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    type: String,
    description: "Cafe's Instagram Link",
    example: 'https://www.instagram.com/cafe_baleine',
    required: false,
  })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiProperty({
    type: String,
    description: "Cafe's Navermap Link",
    example: 'https://naver.me/G2EI8IYr',
    required: false,
  })
  @IsString()
  @IsOptional()
  naverMap?: string;

  @ApiProperty({
    type: String,
    description: "Cafe's Phone number",
    example: '02-1234-5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    type: Array<string>,
    description: 'Image file s3 key list',
    example: ['staging/1739171538853-x51z517a99e006.png'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
