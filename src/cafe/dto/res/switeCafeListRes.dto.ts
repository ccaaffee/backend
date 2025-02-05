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
  hasNextPage: boolean; // Indicates whether there is a next page
}
