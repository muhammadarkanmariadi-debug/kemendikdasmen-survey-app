import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UuidService } from 'src/uuid/uuid.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';

@Module({
  controllers: [AdminsController],
  providers: [AdminsService, UuidService, BcryptService],
  imports: [PrismaModule]
})
export class AdminsModule { }
