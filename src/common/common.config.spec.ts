import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Environment } from '../app.types';
import { CommonConfigService } from './common.config';

describe('CommonConfigService', () => {
  let service: CommonConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NODE_ENV') {
                return Environment.Test;
              }

              if (key === 'API_KEY') {
                return 'bird';
              }

              if (key === 'FRONT_API_URL') {
                return 'localhost';
              }

              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CommonConfigService>(CommonConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('env', () => {
    it('should be test', () => {
      expect(service.env).toBe(Environment.Test);
    });

    it('should not be production', () => {
      expect(service.env).not.toBe(Environment.Production);
    });
  });

  describe('apiKey', () => {
    it('should be bird', () => {
      expect(service.apiKey).toBe('bird');
    });

    it('should not be cat', () => {
      expect(service.apiKey).not.toBe('cat');
    });
  });

  describe('frontApiUrl', () => {
    it('should be localhost', () => {
      expect(service.frontApiUrl).toBe('localhost');
    });

    it('should not be google', () => {
      expect(service.frontApiUrl).not.toBe('google.com');
    });
  });
});
