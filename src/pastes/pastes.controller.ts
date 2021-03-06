import {
  Controller,
  Post,
  Param,
  Get,
  UseInterceptors,
  UploadedFile,
  Header,
  ForbiddenException,
} from '@nestjs/common';
import { PastesService } from './pastes.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CreatePasteDto } from './dto/create-paste.dto';
import { Auth } from '../auth/auth.decorator';

@Controller('p')
@ApiTags('pastes')
export class PastesController {
  constructor(private readonly pastesService: PastesService) {}

  @Get(':id')
  @Header('content-type', 'text/plain')
  @ApiProduces('text/plain')
  async findOne(@Param('id') stringId: string) {
    const paste = await this.pastesService.findOne(stringId);
    return paste.content;
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Paste file upload.',
    type: CreatePasteDto,
  })
  @UseInterceptors(FileInterceptor('paste'))
  @Auth()
  create(@UploadedFile() file: Express.Multer.File) {
    return this.pastesService.create(file);
  }

  @Get('delete/:key')
  async deleteCode(@Param('key') key: string) {
    const paste = await this.pastesService.findOneByDeleteKey(key);

    const { deletePass } = paste;

    return deletePass;
  }

  @Get('delete/:key/:pass')
  async delete(@Param('key') key: string, @Param('pass') pass: string) {
    const paste = await this.pastesService.findOneByDeleteKey(key);

    const { deletePass } = paste;

    if (deletePass !== pass) {
      throw new ForbiddenException();
    }

    await this.pastesService.delete(key);

    return 'Deleted';
  }
}
