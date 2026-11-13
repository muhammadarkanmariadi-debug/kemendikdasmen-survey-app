import { Test, TestingModule } from '@nestjs/testing';
import { LokasiPetugasService } from './lokasi_petugas.service';

describe('LokasiPetugasService', () => {
  let service: LokasiPetugasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LokasiPetugasService],
    }).compile();

    service = module.get<LokasiPetugasService>(LokasiPetugasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
