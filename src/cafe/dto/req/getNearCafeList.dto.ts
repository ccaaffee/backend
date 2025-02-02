import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetNearCafeListDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  longitude: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  radiusInMeter: number;
}
