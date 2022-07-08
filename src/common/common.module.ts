import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonConfigService } from './common.config';

@Module({
  imports: [ConfigModule],
  providers: [CommonConfigService],
  exports: [CommonConfigService],
})
export class CommonModule {}
