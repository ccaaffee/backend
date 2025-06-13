import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { GeneralCafeResDto } from './dto/res/generalCafe.dto';
import { SetCafePreferenceDto } from './dto/req/setCafePreference.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PreferenceStatusDto } from './dto/res/preferenceStatus.dto';
import { PaginationCafeListResDto } from './dto/res/paginationCafeListRes.dto';
import { GetSwipeCafeListDto } from './dto/req/getSwipeCafeList.dto';
import { PaginationDto } from './dto/req/pagination.dto';

@Controller('cafe')
export class CafeController {
  constructor(private readonly cafeService: CafeService) {}

  @ApiOperation({
    summary: 'get near cafe list',
  })
  @ApiOkResponse({
    type: Array<GeneralCafeResDto>,
    description: 'Near cafe list based on given gps',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Get('near')
  @UseGuards(JwtAuthGuard)
  async getNearCafeList(
    @GetUser() user: User,
    @Query() query: GetNearCafeListDto,
  ): Promise<GeneralCafeResDto[]> {
    return await this.cafeService.getNearCafeList(query, user.uuid);
  }

  @ApiOperation({
    summary: 'get my liked cafe list',
  })
  @ApiOkResponse({
    type: PaginationCafeListResDto,
    description: 'Cafe list that I liked',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Get('liked')
  @UseGuards(JwtAuthGuard)
  async getMyLikeCafeList(
    @GetUser() user: User,
    @Query() query: PaginationDto,
  ): Promise<PaginationCafeListResDto> {
    return await this.cafeService.getMyLikeCafeList(user.uuid, query);
  }

  @ApiOperation({
    summary: 'search cafe by name',
  })
  @ApiOkResponse({
    type: PaginationCafeListResDto,
    description: 'Cafe list containing search keyword',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Get('search/name')
  @UseGuards(JwtAuthGuard)
  async searchCafeByName(
    @Query('name') name: string,
    @Query() query: PaginationDto,
    @GetUser() user?: User,
  ): Promise<PaginationCafeListResDto> {
    if (!name || name.trim() === '') {
      throw new BadRequestException('Name is required');
    }

    return await this.cafeService.searchCafeByName(name, query, user?.uuid);
  }

  @ApiOperation({
    summary: 'get detailed cafe info',
  })
  @ApiOkResponse({
    type: GeneralCafeResDto,
    description: 'Detailed cafe information',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCafe(@Param('id', ParseIntPipe) id: number, @GetUser() user?: User) {
    return this.cafeService.getCafe(id, user?.uuid);
  }

  @ApiOperation({
    summary: 'add cafe data',
    description: 'only available adminitrator or permitted person',
  })
  @ApiOkResponse({
    type: GeneralCafeResDto,
    description: 'Created cafe information',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(JwtAuthGuard)
  async createCafe(@Body() createCafeDto: CreateCafeDto) {
    // 추후, 관리자 혹은 특정 권한을 사진 사용자만 등록할 수 있도록 수정 필요
    return await this.cafeService.createCafe(createCafeDto);
  }

  @ApiOperation({
    summary: 'update cafe info',
  })
  @ApiOkResponse({
    type: GeneralCafeResDto,
    description: 'Updated cafe information with detail',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateCafe(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCafeDto: UpdateCafeDto,
  ) {
    return await this.cafeService.updateCafe(id, updateCafeDto);
  }

  @ApiOperation({
    summary: 'delete cate',
  })
  @ApiOkResponse({
    type: HttpCode(201),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCafe(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.cafeService.deleteCafe(id);
  }

  @ApiOperation({
    summary: 'set cafe preference status',
  })
  @ApiOkResponse({
    type: PreferenceStatusDto,
    description: 'Cafe preference status',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Post(':id/preference')
  @UseGuards(JwtAuthGuard)
  async setCafePreference(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) cafeId: number,
    @Body() setCafePreferenceDto: SetCafePreferenceDto,
  ): Promise<PreferenceStatusDto> {
    return await this.cafeService.setCafePreference(
      user.uuid,
      cafeId,
      setCafePreferenceDto,
    );
  }

  @ApiOperation({
    summary: 'get my prefenrence status for cafe',
  })
  @ApiOkResponse({
    type: PreferenceStatusDto,
    description: 'My preference status for specific cafe',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Get(':id/preference')
  @UseGuards(JwtAuthGuard)
  async getCafePreference(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) cafeId: number,
  ): Promise<PreferenceStatusDto> {
    return await this.cafeService.getCafePreference(user.uuid, cafeId);
  }

  @ApiOperation({
    summary: 'get swiping near cafe list',
    description:
      '카페를 평가(스와이핑)하기 위해, 좌표를 기반으로 일정 거리 내에 있는 카페들을 반환합니다.',
  })
  @ApiOkResponse({
    type: PaginationCafeListResDto,
    description: 'Swiping target cafe list',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Get('swipe/search')
  @UseGuards(JwtAuthGuard)
  async getSwipeCafeList(
    @GetUser() user: User,
    @Query() query: GetSwipeCafeListDto,
  ): Promise<PaginationCafeListResDto> {
    return await this.cafeService.getSwipeCafeList(user, query);
  }
}
