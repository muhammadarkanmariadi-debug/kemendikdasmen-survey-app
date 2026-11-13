import { Module } from '@nestjs/common';
import { RespondenService } from './responden.service';
import { RespondenController } from './responden.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidService } from 'src/uuid/uuid.service';

@Module({
  controllers: [RespondenController],
  providers: [RespondenService, UuidService],
  imports: [PrismaModule]
})
export class RespondenModule {}
