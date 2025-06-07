import { ApiProperty } from '@nestjs/swagger';

export class NicknameDuplicateCheckDto {
  @ApiProperty({
    type: Boolean,
    description: 'Whether nickname is duplicate or not',
    example: false,
  })
  isDuplicate: boolean;
}
