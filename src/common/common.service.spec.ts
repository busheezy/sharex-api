import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from './common.service';

describe('CommonService', () => {
  let service: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonService],
    }).compile();

    service = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('randomString', () => {
    describe('when getting a random string', () => {
      it('should return a string', async () => {
        const randomString = service.randomString();
        const randomString2 = service.randomString();

        expect(randomString).toBeDefined();
        expect(randomString).toHaveLength(6);

        expect(randomString2).toBeDefined();
        expect(randomString2).toHaveLength(6);

        expect(randomString).not.toBe(randomString2);
      });
    });
  });
});
