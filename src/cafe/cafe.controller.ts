import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CafeService } from './cafe.service';

import { JwtAuthGuard } from 'src/auth/jwt.auth.strategy';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { CreateCafeDto } from './dto/req/createCafe.dto';
import { UpdateCafeDto } from './dto/req/updateCafe.dto';
import { GetNearCafeListDto } from './dto/req/getNearCafeList.dto';
import { GeneralCafeDto } from './dto/res/generalCafe.dto';
import { SetCafePreferenceDto } from './dto/req/setCafePreference.dto';

@Controller('cafe')
export class CafeController {
  constructor(private readonly cafeService: CafeService) {}

  @Get('near')
  async getNearCafeList(
    @Query() query: GetNearCafeListDto,
  ): Promise<GeneralCafeDto[]> {
    return await this.cafeService.getNearCafeList(query);
  }

  @Get(':id')
  async getCafe(@Param('id', ParseIntPipe) id: number) {
    return this.cafeService.getCafe(id);
  }

  @Post()
  async createCafe(@Body() createCafeDto: CreateCafeDto) {
    // 추후, 관리자 혹은 특정 권한을 사진 사용자만 등록할 수 있도록 수정 필요
    return await this.cafeService.createCafe(createCafeDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateCafe(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCafeDto: UpdateCafeDto,
  ) {
    return await this.cafeService.updateCafe(id, updateCafeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCafe(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.cafeService.deleteCafe(id);
  }

  @Post(':id/preference')
  @UseGuards(JwtAuthGuard)
  async setCafePreference(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) cafeId: number,
    @Body() setCafePreferenceDto: SetCafePreferenceDto,
  ) {
    return await this.cafeService.setCafePreference(
      user.uuid,
      cafeId,
      setCafePreferenceDto,
    );
  }

  @Get(':id/preference')
  @UseGuards(JwtAuthGuard)
  async getCafePreference(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) cafeId: number,
  ) {
    return await this.cafeService.getCafePreference(user.uuid, cafeId);
  }
}
