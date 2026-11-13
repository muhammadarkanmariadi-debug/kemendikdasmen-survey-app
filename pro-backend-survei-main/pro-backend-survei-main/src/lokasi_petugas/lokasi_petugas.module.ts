import { Module } from '@nestjs/common';
import { LokasiPetugasService } from './lokasi_petugas.service';
import { LokasiPetugasController } from './lokasi_petugas.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidService } from 'src/uuid/uuid.service';

@Module({
  controllers: [LokasiPetugasController],
  providers: [LokasiPetugasService, UuidService],
  imports: [PrismaModule],
})
export class LokasiPetugasModule {}
