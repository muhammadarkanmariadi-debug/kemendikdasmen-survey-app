import { Test, TestingModule } from '@nestjs/testing';
import { InstansiService } from './instansi.service';

describe('InstansiService', () => {
  let service: InstansiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstansiService],
    }).compile();

    service = module.get<InstansiService>(InstansiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
