import { Module } from '@nestjs/common';
import { PastesService } from './pastes.service';
import { PastesController } from './pastes.controller';
import { Paste } from './entities/paste.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Paste])],
  controllers: [PastesController],
  providers: [PastesService],
})
export class PastesModule {}
