import { Test, TestingModule } from '@nestjs/testing';
import { PastesController } from './pastes.controller';
import { PastesService } from './pastes.service';

describe('PastesController', () => {
  let controller: PastesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PastesController],
      providers: [PastesService],
    }).compile();

    controller = module.get<PastesController>(PastesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
