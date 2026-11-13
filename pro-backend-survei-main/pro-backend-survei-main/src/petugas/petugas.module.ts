import { Module } from '@nestjs/common';
import { PetugasService } from './petugas.service';
import { PetugasController } from './petugas.controller';
import { UuidService } from 'src/uuid/uuid.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [PetugasController],
  providers: [PetugasService, UuidService, BcryptService],
  imports: [PrismaModule]
})
export class PetugasModule {}
