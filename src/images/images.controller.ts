import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Response,
  Get,
  StreamableFile,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '../auth/auth.decorator';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import { unlink } from 'node:fs/promises';

@Controller('i')
@ApiTags('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'We are returning the image.',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('image/*')
  async findOne(
    @Param('id') stringId: string,
    @Response({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    const image = await this.imagesService.findOne(stringId);

    if (!image) {
      throw new NotFoundException();
    }

    const file = createReadStream(
      join(process.cwd(), 'uploads', 'images', image.fileName),
    );

    res.set({
      'Content-Type': image.fileType,
    });

    return new StreamableFile(file);
  }

  @Get(':id/thumbnail')
  @ApiOkResponse({
    description: 'We are returning the image thumbnail.',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('image/*')
  async findOneThumbnail(
    @Param('id') stringId: string,
    @Response({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    const image = await this.imagesService.findOne(stringId);

    if (!image) {
      throw new NotFoundException();
    }

    const imageFile = createReadStream(
      join(process.cwd(), 'thumbnails', 'images', image.fileName),
    );

    res.set({
      'Content-Type': image.fileType,
    });

    return new StreamableFile(imageFile);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file upload.',
    type: CreateImageDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  @Auth()
  async create(@UploadedFile() file: Express.Multer.File) {
    await this.imagesService.generateThumbnail(file);
    const createdImage = await this.imagesService.create(file);
    return createdImage;
  }

  @Get('delete/:key')
  async deleteCode(@Param('key') key: string) {
    const image = await this.imagesService.findOneByDeleteKey(key);

    if (!image) {
      throw new NotFoundException();
    }

    const { deletePass } = image;

    return deletePass;
  }

  @Get('delete/:key/:pass')
  async delete(@Param('key') key: string, @Param('pass') pass: string) {
    const image = await this.imagesService.findOneByDeleteKey(key);

    if (!image) {
      throw new NotFoundException();
    }

    const { deletePass } = image;

    if (deletePass !== pass) {
      throw new ForbiddenException();
    }

    const imagePath = join(process.cwd(), 'uploads', 'images', image.fileName);
    await unlink(imagePath);

    const thumbnailPath = join(
      process.cwd(),
      'thumbnails',
      'images',
      image.fileName,
    );
    await unlink(thumbnailPath);

    await this.imagesService.delete(key);

    return 'Deleted';
  }
}
