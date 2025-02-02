import { PreferenceStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class SetCafePreferenceDto {
  @IsNotEmpty()
  @IsEnum(PreferenceStatus, {
    message: 'status는 LIKE, DISLIKE, HOLD 중 하나여야 합니다.',
  })
  status: PreferenceStatus;
}
