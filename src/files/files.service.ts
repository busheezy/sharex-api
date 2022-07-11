import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../common/common.service';
import { File } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,

    private readonly commonService: CommonService,
  ) {}
  async findOne(stringId: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: {
        stringId,
      },
    });

    return file;
  }

  async create(file: Express.Multer.File): Promise<File> {
    const fileShare = new File();

    fileShare.deleteKey = this.commonService.randomString();
    fileShare.deletePass = this.commonService.randomString();
    fileShare.stringId = this.commonService.randomString();

    fileShare.fileName = file.filename;
    fileShare.originalFileName = file.originalname;
    fileShare.fileType = file.mimetype;

    await this.fileRepo.insert(fileShare);

    return fileShare;
  }
}
