import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { API_KEY_NAME } from './auth.consts';
import { AuthenticatedGuard } from './auth.guard';

export function Auth() {
  return applyDecorators(
    UseGuards(AuthenticatedGuard),
    ApiSecurity(API_KEY_NAME),
  );
}
