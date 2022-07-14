import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../app.types';

@Injectable()
export class CommonConfigService {
  constructor(private readonly configService: ConfigService) {}

  get env(): Environment {
    return this.configService.get('NODE_ENV');
  }

  get apiKey(): string {
    return this.configService.get('API_KEY');
  }

  get apiUrl(): string {
    return this.configService.get('API_URL');
  }
}
