import { Test, TestingModule } from '@nestjs/testing';
import { SharesController } from './shares.controller';
import { SharesService } from './shares.service';

describe('SharesController', () => {
  let controller: SharesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharesController],
      providers: [SharesService],
    }).compile();

    controller = module.get<SharesController>(SharesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
