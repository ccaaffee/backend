import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'Request page number(default: 1)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

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
