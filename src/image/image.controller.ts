import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt.auth.strategy';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @ApiOperation({
    summary: 'upload images',
    description: 'upload multiple images and return keys',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of images to upload',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOkResponse({
    type: [String],
    description: 'Return keys of uploaed images',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiBearerAuth('JWT')
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png)$/)) {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImages(
    @GetUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.imageService.uploadImages(files);
  }
}
