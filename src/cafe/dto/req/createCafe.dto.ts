import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCafeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
