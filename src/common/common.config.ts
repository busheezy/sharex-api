import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../app.types';

@Injectable()
export class CommonConfigService {
  constructor(private readonly configService: ConfigService) {}

  get env(): Environment {
    return this.configService.get('NODE_ENV');
  }
}
