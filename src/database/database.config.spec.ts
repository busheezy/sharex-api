import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConfigService } from './database.config';

describe('DatabaseConfigService', () => {
  let service: DatabaseConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'DB_HOST') {
                return 'localhost';
              }

              if (key === 'DB_PORT') {
                return 1234;
              }

              if (key === 'DB_USERNAME') {
                return 'bird';
              }

              if (key === 'DB_PASSWORD') {
                return 'pass';
              }

              if (key === 'DB_DATABASE') {
                return 'database';
              }

              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseConfigService>(DatabaseConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('host', () => {
    it('should be test', () => {
      expect(service.host).toBe('localhost');
    });

    it('should not be production', () => {
      expect(service.host).not.toBe('google.com');
    });
  });

  describe('port', () => {
    it('should be test', () => {
      expect(service.port).toBe(1234);
    });

    it('should not be production', () => {
      expect(service.port).not.toBe('1234');
    });
  });

  describe('username', () => {
    it('should be test', () => {
      expect(service.username).toBe('bird');
    });

    it('should not be production', () => {
      expect(service.username).not.toBe('cat');
    });
  });

  describe('password', () => {
    it('should be test', () => {
      expect(service.password).toBe('pass');
    });

    it('should not be production', () => {
      expect(service.password).not.toBe('not.pass');
    });
  });

  describe('database', () => {
    it('should be test', () => {
      expect(service.database).toBe('database');
    });

    it('should not be production', () => {
      expect(service.database).not.toBe('not.database');
    });
  });
});
