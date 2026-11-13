import { Test, TestingModule } from '@nestjs/testing';
import { JenisRespondenController } from './jenis-responden.controller';
import { JenisRespondenService } from './jenis-responden.service';

describe('JenisRespondenController', () => {
  let controller: JenisRespondenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JenisRespondenController],
      providers: [JenisRespondenService],
    }).compile();

    controller = module.get<JenisRespondenController>(JenisRespondenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
