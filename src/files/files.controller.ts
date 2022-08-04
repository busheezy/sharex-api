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
import { CreateFileDto } from './dto/create-file.dto';
import { Auth } from '../auth/auth.decorator';

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
    const file = await this.filesService.findOne(stringId);

    if (!file) {
      throw new NotFoundException();
    }

    res.set({
      'Content-Type': file.fileType,
      'Content-Disposition': `attachment; filename=${file.originalFileName}`,
    });

    return this.filesService.streamFile(file);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload.',
    type: CreateFileDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Auth()
  create(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.create(file);
  }

  @Get('delete/:key')
  async deleteCode(@Param('key') key: string) {
    const file = await this.filesService.findOneByDeleteKey(key);

    const { deletePass } = file;

    return deletePass;
  }

  @Get('delete/:key/:pass')
  async delete(@Param('key') key: string, @Param('pass') pass: string) {
    const file = await this.filesService.findOneByDeleteKey(key);

    const { deletePass } = file;

    if (deletePass !== pass) {
      throw new ForbiddenException();
    }

    await this.filesService.deleteFile(file);
    await this.filesService.delete(key);

    return 'Deleted';
  }
}
