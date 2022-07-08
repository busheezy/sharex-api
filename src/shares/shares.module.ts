import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { Share } from './entities/share.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Share])],
  controllers: [SharesController],
  providers: [SharesService],
})
export class SharesModule {}
