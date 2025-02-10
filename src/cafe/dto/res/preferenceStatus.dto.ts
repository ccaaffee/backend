import { ApiProperty } from '@nestjs/swagger';
import { PreferenceStatus } from '@prisma/client';
import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';

export class PreferenceStatusDto {
  @ApiProperty({
    enum: PreferenceStatus,
    enumName: 'PreferenceStatus',
    description: 'Preference Status of Cafe(LIKE, DISLIKE, HOLD)',
    example: PreferenceStatus.LIKE,
  })
  @IsEnum(PreferenceStatus)
  @IsNotEmpty()
  status: PreferenceStatus;

  @ApiProperty({
    type: Date,
    description: "Cafe's created Date",
    example: '2025-01-30T15:34:28.284Z',
  })
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
