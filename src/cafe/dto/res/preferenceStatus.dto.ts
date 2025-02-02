import { ApiProperty } from '@nestjs/swagger';
import { PreferenceStatus } from '@prisma/client';

export class PreferenceStatusDto {
  @ApiProperty({
    enum: PreferenceStatus,
    enumName: 'PreferenceStatus',
    description: 'Preference Status of Cafe(LIKE, DISLIKE, HOLD)',
    example: PreferenceStatus.LIKE,
  })
  status: PreferenceStatus;

  updatedAt: Date;
}
