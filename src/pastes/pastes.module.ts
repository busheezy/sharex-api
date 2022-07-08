import { Module } from '@nestjs/common';
import { PastesService } from './pastes.service';
import { PastesController } from './pastes.controller';
import { Paste } from './entities/paste.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Paste])],
  controllers: [PastesController],
  providers: [PastesService],
})
export class PastesModule {}
