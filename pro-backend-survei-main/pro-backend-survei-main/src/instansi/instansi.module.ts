import { Module } from '@nestjs/common';
import { InstansiService } from './instansi.service';
import { InstansiController } from './instansi.controller';
import { UuidService } from 'src/uuid/uuid.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BcryptService } from 'src/bcrypt/bcrypt.service';

@Module({
  controllers: [InstansiController],
  providers: [InstansiService, UuidService, BcryptService],
  imports: [PrismaModule],
})
export class InstansiModule { }
