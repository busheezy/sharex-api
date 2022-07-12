import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../common/common.service';
import { Image } from './entities/image.entity';
import * as sharp from 'sharp';
import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import { createReadStream } from 'node:fs';

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

    if (!image) {
      throw new NotFoundException();
    }

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

  async findOneByDeleteKey(deleteKey: string): Promise<Image> {
    const image = await this.imageRepo.findOne({
      where: {
        deleteKey,
      },
    });

    if (!image) {
      throw new NotFoundException();
    }

    return image;
  }

  async delete(deleteKey: string) {
    const result = await this.imageRepo.delete({
      deleteKey,
    });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }

  async deleteImages(image: Image) {
    const imagePath = join(process.cwd(), 'uploads', 'images', image.fileName);

    await unlink(imagePath);

    const thumbnailPath = join(
      process.cwd(),
      'thumbnails',
      'images',
      image.fileName,
    );

    await unlink(thumbnailPath);
  }

  streamImage(image: Image): StreamableFile {
    return new StreamableFile(
      createReadStream(
        join(process.cwd(), 'uploads', 'images', image.fileName),
      ),
    );
  }

  streamImageThumbnail(image: Image): StreamableFile {
    return new StreamableFile(
      createReadStream(
        join(process.cwd(), 'thumbnails', 'images', image.fileName),
      ),
    );
  }
}
