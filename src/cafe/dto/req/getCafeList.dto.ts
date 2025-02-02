import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetCafeListGpsQueryDto {
  @IsNumber()
  @IsNotEmpty()
  latitude: Float32Array;

  @IsNumber()
  @IsNotEmpty()
  longitude: Float32Array;
}
