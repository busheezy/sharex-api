import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonConfigService } from './common.config';
import { CommonService } from './common.service';

@Module({
  imports: [ConfigModule],
  providers: [CommonConfigService, CommonService],
  exports: [CommonConfigService, CommonService],
})
export class CommonModule {}
