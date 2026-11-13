import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { UuidService } from 'src/uuid/uuid.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [SubmissionController],
  providers: [SubmissionService, UuidService, BcryptService],
  imports: [PrismaModule]
})
export class SubmissionModule {}
