import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Get,
  Res,
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
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('i')
@ApiTags('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'We are returning the image.',
  })
  @ApiProduces('image/*')
  async findOne(@Param('id') stringId: string, @Res() res: Response) {
    const image = await this.imagesService.findOne(stringId);

    const file = createReadStream(
      join(process.cwd(), 'uploads', 'images', image.fileName),
    );

    file.pipe(res);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file upload.',
    type: CreateImageDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  create(@UploadedFile() file: Express.Multer.File) {
    return this.imagesService.create(file);
  }
}
