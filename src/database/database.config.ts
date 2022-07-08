import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService {
  constructor(private readonly configService: ConfigService) {}

  get host(): string {
    return this.configService.get('DB_HOST');
  }

  get port(): number {
    return this.configService.get('DB_PORT');
  }

  get username(): string {
    return this.configService.get('DB_USERNAME');
  }

  get password(): string {
    return this.configService.get('DB_PASSWORD');
  }

  get database(): string {
    return this.configService.get('DB_DATABASE');
  }
}
