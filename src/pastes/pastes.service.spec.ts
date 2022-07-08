import { Test, TestingModule } from '@nestjs/testing';
import { PastesService } from './pastes.service';

describe('PastesService', () => {
  let service: PastesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PastesService],
    }).compile();

    service = module.get<PastesService>(PastesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
