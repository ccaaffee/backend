import { ApiProperty } from '@nestjs/swagger';
import { GeneralCafeResDto } from './generalCafe.dto';

export class SwipeCafeListResDto {
  @ApiProperty({ type: [GeneralCafeResDto] })
  data: GeneralCafeResDto[];

  @ApiProperty()
  nextPage: number;

  @ApiProperty()
  cafeCount: number;

  @ApiProperty()
  hasNextPage: boolean; // 다음 페이지가 존재하는지 여부
}
