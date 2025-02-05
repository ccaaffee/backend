import { ApiProperty } from '@nestjs/swagger';
import { GetNearCafeListDto } from './getNearCafeList.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSwipeCafeListDto extends GetNearCafeListDto {
  @ApiProperty({
    example: 1,
    description: 'Request page number(default: 1)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number;

  @ApiProperty({
    example: 20,
    description: 'Number of pages to get(default: 20)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  take?: number = 20;
}
