import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFileDto } from './dto/create-file.dto';
import { File } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private shareRepository: Repository<File>,
  ) {}

  findOne(stringId: string) {
    return this.shareRepository.findOne({
      where: {
        stringId,
      },
    });
  }

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }
}
