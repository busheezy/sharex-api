import { Environment } from './app.types';
import { validate } from './env.validation';
import 'reflect-metadata';

type EnvVars = Record<string, unknown>;

describe('Environment Validation', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('Will have environment variables', () => {
    const envVars: EnvVars = {
      NODE_ENV: Environment.Test,
      DB_HOST: 'bird',
      DB_PORT: 1234,
      DB_USERNAME: 'hank',
      DB_PASSWORD: 'bird',
      DB_DATABASE: 'bill',
      API_KEY: 'spaghetti',
      FRONT_API_URL: 'localhost',
    };

    const validatedEnvVars = validate(envVars);

    it('should validate without errors', async () => {
      expect(validatedEnvVars).toBeDefined();
    });

    it('should be testing env', async () => {
      expect(validatedEnvVars.NODE_ENV).toBeDefined();
    });

    it('should have db info', async () => {
      expect(validatedEnvVars.DB_HOST).toBeDefined();
      expect(validatedEnvVars.DB_PORT).toBeDefined();
      expect(validatedEnvVars.DB_PORT).toBe(1234);
      expect(validatedEnvVars.DB_USERNAME).toBeDefined();
      expect(validatedEnvVars.DB_PASSWORD).toBeDefined();
      expect(validatedEnvVars.DB_DATABASE).toBeDefined();
    });

    it('should have api key', async () => {
      expect(validatedEnvVars.API_KEY).toBeDefined();
    });

    it('should have front api url', async () => {
      expect(validatedEnvVars.FRONT_API_URL).toBeDefined();
    });
  });

  describe('Will not have environment variables', () => {
    const envVars: EnvVars = {
      NODE_ENV: Environment.Test,
    };

    it('should error', async () => {
      try {
        validate(envVars);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
