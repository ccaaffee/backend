import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [ImageController],
  providers: [ImageService, S3Client],
  exports: [ImageService],
})
export class ImageModule {}
