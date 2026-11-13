import { Module } from '@nestjs/common';
import { JenisRespondenService } from './jenis-responden.service';
import { JenisRespondenController } from './jenis-responden.controller';
import { UuidService } from 'src/uuid/uuid.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [JenisRespondenController],
  providers: [JenisRespondenService, UuidService],
  imports: [PrismaModule],
})
export class JenisRespondenModule { }
