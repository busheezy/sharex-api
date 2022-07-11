import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../common/common.service';
import { Image } from './entities/image.entity';
import { Express } from 'express';

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

    await this.imageRepo.insert(image);

    return image;
  }
}
