import { PartialType } from '@nestjs/swagger';

import { CreateCafeDto } from './createCafe.dto';

export class UpdateCafeDto extends PartialType(CreateCafeDto) {}
