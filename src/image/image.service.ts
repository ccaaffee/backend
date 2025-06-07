import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import sharp from 'sharp';

export enum ImageType {
  CAFE = 'cafe',
  PROFILE = 'profile',
}

@Injectable()
export class ImageService {
  private readonly bucketName: string;
  private readonly environment: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Client: S3Client,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    this.environment =
      this.configService.get<string>('NODE_ENV') || 'development';
  }

  /**
   * 이미지 파일을 여러 개 업로드
   * @param files Express.Multer.File[]
   * @param type ImageType
   * @returns string[]
   */
  async uploadImages(
    files: Express.Multer.File[],
    type: ImageType = ImageType.CAFE,
  ): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, type)));
  }

  /**
   * 프로필 이미지 업로드 (1:1 비율로 크롭)
   * @param file Express.Multer.File
   * @returns string
   */
  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    const processedFile = await this.processProfileImage(file);
    return this.uploadImage(processedFile, ImageType.PROFILE);
  }

  /**
   * S3에 단일 이미지 업로드
   * @param file Express.Multer.File
   * @param type ImageType
   * @returns string
   */
  private async uploadImage(
    file: Express.Multer.File,
    type: ImageType,
  ): Promise<string> {
    const key = `${this.environment}/${type}/${Date.now()}-${Math.random().toString(36).substring(2)}${file.originalname}`;

    const webpFile = await this.convertToWebp(file);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: webpFile.buffer,
      Tagging: 'expiration=true',
      Metadata: {
        originalName: encodeURIComponent(file.originalname),
      },
    });

    try {
      await this.s3Client.send(command);
      return key;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * 프로필 이미지 처리 (1:1 비율로 크롭)
   * @param file Express.Multer.File
   * @returns Express.Multer.File
   */
  private async processProfileImage(
    file: Express.Multer.File,
  ): Promise<Express.Multer.File> {
    try {
      const metadata = await sharp(file.buffer).metadata();
      const size = Math.min(metadata.width, metadata.height);

      file.buffer = await sharp(file.buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .toBuffer();

      return file;
    } catch (error) {
      console.log(error);
      if (error.message.includes('unsupported image format')) {
        throw new BadRequestException('Unsupported image format');
      }
      throw new InternalServerErrorException('Failed to process profile image');
    }
  }

  /**
   * S3에서 단일 이미지 삭제
   * @param key string
   */
  private async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to delete fiel');
    }
  }

  /**
   * 이미지를 WebP 형식으로 변환
   * @param file Express.Multer.File
   * @returns Express.Multer.File
   */
  private async convertToWebp(
    file: Express.Multer.File,
  ): Promise<Express.Multer.File> {
    try {
      file.buffer = await sharp(file.buffer)
        .rotate()
        .webp({ effort: 5 })
        .toBuffer();

      return file;
    } catch (error) {
      console.log(error);

      if (error.message.includes('unsupported image format')) {
        throw new BadRequestException('Unsupported image format');
      }
      throw new InternalServerErrorException('Failed to convert image to WebP');
    }
  }

  /**
   * s3에 있는 multiple images를 validate
   * @param key string[]
   */
  async validateImages(key: string[]): Promise<void> {
    await Promise.all(key.map((k) => this.validateImage(k)));
  }

  /**
   * s3에 있는 single image를 validate
   * 만약 존재하는 이미지라면 expiration tag를 false로 변경
   * @param key string
   * @returns void
   */
  private async validateImage(key: string): Promise<void> {
    const command = new PutObjectTaggingCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: key,
      Tagging: {
        TagSet: [{ Key: 'expiration', Value: 'false' }],
      },
    });
    await this.s3Client.send(command).catch((error) => {
      if (error.Code === 'AccessDenied') {
        throw new NotFoundException('Image key is invalid');
      }

      throw new InternalServerErrorException();
    });
  }

  /**
   * multiple keys에 대한 signed URLs 생성하기
   * @param keys string[]
   * @returns string[]
   */
  async generateSignedUrls(keys: string[]): Promise<string[]> {
    try {
      const signedUrls = await Promise.all(
        keys.map((key) =>
          getSignedUrl(
            this.s3Client,
            new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
            {
              expiresIn: 10800, // URL 유효 기간 (초), 1시간 설정
            },
          ),
        ),
      );
      return signedUrls;
    } catch (error) {
      console.error('Error generating signed URLs:', error);
      throw new InternalServerErrorException('Failed to generate signed URLs');
    }
  }

  /**
   * single key에 대한 signed URL 생성하기
   * @param keys string
   * @returns string
   */
  async generateSignedUrl(key: string): Promise<string> {
    try {
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
        {
          expiresIn: 10800, // URL 유효 기간 (초), 1시간 설정
        },
      );

      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }
}
