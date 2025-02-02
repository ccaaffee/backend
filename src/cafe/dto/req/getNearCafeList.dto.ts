import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class GetNearCafeListDto {
  @ApiProperty({
    type: Number,
    description: "Cafe's Latitude",
    example: 37.485772,
  })
  @IsNumber()
  @IsNotEmpty()
  // @Type(() => Number)
  latitude: number;

  @ApiProperty({
    type: Number,
    description: "Cafe's Longitude",
    example: 126.927983,
  })
  @IsNumber()
  @IsNotEmpty()
  // @Type(() => Number)
  longitude: number;

  @ApiProperty({
    type: Number,
    description: 'Search Radius in Meter',
    example: 1000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(100, { message: 'Radius must be at least 100 meters' })
  @Max(5000, { message: 'Radius cannot exceed 5000 meters' })
  @Type(() => Number)
  radiusInMeter: number;
}
