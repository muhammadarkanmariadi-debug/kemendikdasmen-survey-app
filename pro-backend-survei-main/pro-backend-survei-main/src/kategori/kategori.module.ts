import { Module } from '@nestjs/common';
import { KategoriService } from './kategori.service';
import { KategoriController } from './kategori.controller';
import { UuidService } from 'src/uuid/uuid.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [KategoriController],
  providers: [KategoriService, UuidService],
  imports: [PrismaModule],
})
export class KategoriModule {}
 