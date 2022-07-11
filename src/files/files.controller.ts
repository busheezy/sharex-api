import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Get,
  Response,
  StreamableFile,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { CreateFileDto } from './dto/create-file.dto';
import { unlink } from 'fs/promises';

@Controller('f')
@ApiTags('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'We are returning the image.',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  async findOne(
    @Param('id') stringId: string,
    @Response({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    const image = await this.filesService.findOne(stringId);

    const file = createReadStream(
      join(process.cwd(), 'uploads', 'files', image.fileName),
    );

    res.set({
      'Content-Type': image.fileType,
      'Content-Disposition': `attachment; filename=${image.originalFileName}`,
    });

    return new StreamableFile(file);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload.',
    type: CreateFileDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  create(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.create(file);
  }

  @Get('delete/:key')
  async deleteCode(@Param('key') key: string) {
    const file = await this.filesService.findOneByDeleteKey(key);

    if (!file) {
      throw new NotFoundException();
    }

    const { deletePass } = file;

    return deletePass;
  }

  @Get('delete/:key/:pass')
  async delete(@Param('key') key: string, @Param('pass') pass: string) {
    const file = await this.filesService.findOneByDeleteKey(key);

    if (!file) {
      throw new NotFoundException();
    }

    const { deletePass } = file;

    if (deletePass !== pass) {
      throw new ForbiddenException();
    }

    const path = join(process.cwd(), 'uploads', 'files', file.fileName);
    await unlink(path);

    await this.filesService.delete(key);

    return 'Deleted';
  }
}
