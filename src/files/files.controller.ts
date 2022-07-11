import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('f')
@ApiTags('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'We are returning the file.',
  })
  async findOne(@Param('id') stringId: string, @Res() res: Response) {
    const fileRes = await this.filesService.findOne(stringId);

    const file = createReadStream(
      join(process.cwd(), 'uploads', 'files', fileRes.fileName),
    );

    file.pipe(res);
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
}
