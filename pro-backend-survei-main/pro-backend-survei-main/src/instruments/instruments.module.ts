import { Module } from '@nestjs/common';
import { InstrumentsService } from './instruments.service';
import { InstrumentsController } from './instruments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidService } from 'src/uuid/uuid.service';

@Module({
  controllers: [InstrumentsController],
  providers: [InstrumentsService, UuidService],
  imports: [PrismaModule]
})
export class InstrumentsModule {}
