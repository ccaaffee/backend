import { ApiProperty } from '@nestjs/swagger';
import { PreferenceStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class SetCafePreferenceDto {
  @ApiProperty({
    enum: PreferenceStatus,
    enumName: 'Preference Status',
    description: 'Preference Status Type(LIKE, DISLIKE, HOLD)',
    example: PreferenceStatus.LIKE,
  })
  @IsNotEmpty()
  @IsEnum(PreferenceStatus, {
    message: 'status는 LIKE, DISLIKE, HOLD 중 하나여야 합니다.',
  })
  status: PreferenceStatus;
}
