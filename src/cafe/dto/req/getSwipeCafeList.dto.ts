import { IntersectionType } from '@nestjs/swagger';
import { GetNearCafeListDto } from './getNearCafeList.dto';
import { PaginationDto } from './pagination.dto';

export class GetSwipeCafeListDto extends IntersectionType(
  GetNearCafeListDto,
  PaginationDto,
) {}
