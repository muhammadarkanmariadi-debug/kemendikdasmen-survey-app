import { Module } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidService } from 'src/uuid/uuid.service';

@Module({
  controllers: [SurveysController],
  providers: [SurveysService, UuidService],
  imports: [PrismaModule]
})
export class SurveysModule {}
