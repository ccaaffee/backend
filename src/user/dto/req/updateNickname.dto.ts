import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateNicknameDto {
  @ApiProperty({
    type: String,
    description: 'New nickname',
    example: '커피러버',
    minLength: 2,
    maxLength: 20,
  })
  @IsString()
  @Length(2, 20)
  nickname: string;
}
