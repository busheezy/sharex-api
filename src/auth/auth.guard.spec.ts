import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { CommonConfigService } from '../common/common.config';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedGuard } from './auth.guard';

describe('AuthGuard', () => {
  let commonConfigService: CommonConfigService;
  let service: AuthenticatedGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonConfigService, ConfigService],
    }).compile();

    commonConfigService = module.get<CommonConfigService>(CommonConfigService);
    service = new AuthenticatedGuard(commonConfigService);
  });

  it('should be defined', () => {
    expect(commonConfigService).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('canActivate', () => {
    it('should have context', () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      expect(mockExecutionContext.switchToHttp()).toBeDefined();
    });

    it('should return false with bad api key', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'x-api-key': 'auth',
            },
          }),
        }),
      });

      jest.spyOn(commonConfigService, 'apiKey', 'get').mockReturnValue('bird');
      const canActivate = await service.canActivate(mockExecutionContext);
      expect(canActivate).toBe(false);
    });

    it('should return true with good api key', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'x-api-key': 'auth',
            },
          }),
        }),
      });

      jest.spyOn(commonConfigService, 'apiKey', 'get').mockReturnValue('auth');
      const canActivate = await service.canActivate(mockExecutionContext);
      expect(canActivate).toBe(true);
    });
  });
});
