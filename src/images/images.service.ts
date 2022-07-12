import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../common/common.service';
import { Image } from './entities/image.entity';
import * as sharp from 'sharp';
import { join } from 'node:path';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepo: Repository<Image>,

    private readonly commonService: CommonService,
  ) {}
  async findOne(stringId: string): Promise<Image> {
    const image = await this.imageRepo.findOne({
      where: {
        stringId,
      },
    });

    return image;
  }

  async create(file: Express.Multer.File): Promise<Image> {
    const image = new Image();

    image.deleteKey = this.commonService.randomString();
    image.deletePass = this.commonService.randomString();
    image.stringId = this.commonService.randomString();

    image.fileName = file.filename;
    image.originalFileName = file.originalname;
    image.fileType = file.mimetype;

    await this.imageRepo.save(image);

    return image;
  }

  async generateThumbnail(file: Express.Multer.File): Promise<void> {
    const thumbnailPath = join(
      process.cwd(),
      'thumbnails',
      'images',
      file.filename,
    );

    await sharp(file.path).resize(128).toFile(thumbnailPath);
  }

  findOneByDeleteKey(deleteKey: string): Promise<Image> {
    return this.imageRepo.findOne({
      where: {
        deleteKey,
      },
    });
  }

  delete(deleteKey: string) {
    return this.imageRepo.delete({
      deleteKey,
    });
  }
}
