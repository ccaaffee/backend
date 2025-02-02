import { Module } from '@nestjs/common';
import { CafeController } from './cafe.controller';
import { CafeService } from './cafe.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CafeRepository } from './cafe.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CafeController],
  providers: [CafeService, CafeRepository],
  exports: [CafeService],
})
export class CafeModule {}
