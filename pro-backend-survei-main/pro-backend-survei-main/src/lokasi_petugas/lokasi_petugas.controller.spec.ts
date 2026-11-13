import { Test, TestingModule } from '@nestjs/testing';
import { LokasiPetugasController } from './lokasi_petugas.controller';
import { LokasiPetugasService } from './lokasi_petugas.service';

describe('LokasiPetugasController', () => {
  let controller: LokasiPetugasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LokasiPetugasController],
      providers: [LokasiPetugasService],
    }).compile();

    controller = module.get<LokasiPetugasController>(LokasiPetugasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
