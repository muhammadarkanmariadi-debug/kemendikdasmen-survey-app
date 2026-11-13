import { Test, TestingModule } from '@nestjs/testing';
import { InstansiController } from './instansi.controller';
import { InstansiService } from './instansi.service';

describe('InstansiController', () => {
  let controller: InstansiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstansiController],
      providers: [InstansiService],
    }).compile();

    controller = module.get<InstansiController>(InstansiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
