import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminsModule } from './admins/admins.module';
import { UuidService } from './uuid/uuid.service';
import { UuidModule } from './uuid/uuid.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { AuthModule } from './auth/auth.module';
import { SurveysModule } from './surveys/surveys.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { KategoriModule } from './kategori/kategori.module';
import { SubmissionModule } from './submission/submission.module';
import { PetugasModule } from './petugas/petugas.module';
import { RespondenModule } from './responden/responden.module';
import { LokasiPetugasModule } from './lokasi_petugas/lokasi_petugas.module';
import { InstansiModule } from './instansi/instansi.module';
import { JenisRespondenModule } from './jenis-responden/jenis-responden.module';
import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 120,
    }]),
    CacheModule.register({
      isGlobal: true,
      ttl: 30000,
    }),
    AdminsModule,
    UuidModule,
    PrismaModule,
    BcryptModule,
    AuthModule,
    SurveysModule,
    InstrumentsModule,
    KategoriModule,
    SubmissionModule,
    PetugasModule,
    RespondenModule,
    LokasiPetugasModule,
    InstansiModule,
    JenisRespondenModule,
    AssignmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UuidService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
