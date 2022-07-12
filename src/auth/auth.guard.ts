import {
  ExecutionContext,
  Injectable,
  CanActivate,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { CommonConfigService } from '../common/common.config';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    @Inject(CommonConfigService)
    private readonly commonConfigService: CommonConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const { apiKey } = this.commonConfigService;

    return request.headers['x-api-key'] == apiKey;
  }
}
