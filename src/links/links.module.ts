import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { Link } from './entities/link.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Link])],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}
