import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCafeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
