import { Test, TestingModule } from '@nestjs/testing';
import { JenisRespondenService } from './jenis-responden.service';

describe('JenisRespondenService', () => {
  let service: JenisRespondenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JenisRespondenService],
    }).compile();

    service = module.get<JenisRespondenService>(JenisRespondenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
