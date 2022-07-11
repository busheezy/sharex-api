import {
  Controller,
  Post,
  Param,
  Get,
  UseInterceptors,
  UploadedFile,
  Header,
} from '@nestjs/common';
import { PastesService } from './pastes.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CreatePasteDto } from './dto/create-paste.dto';

@Controller('p')
@ApiTags('pastes')
export class PastesController {
  constructor(private readonly pastesService: PastesService) {}

  @Get(':id')
  @Header('content-type', 'text/plain')
  @ApiProduces('text/plain')
  findOne(@Param('id') stringId: string) {
    return this.pastesService.findOne(stringId);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Paste file upload.',
    type: CreatePasteDto,
  })
  @UseInterceptors(FileInterceptor('paste'))
  create(@UploadedFile() file: Express.Multer.File) {
    return this.pastesService.create(
      file.originalname,
      file.buffer,
      file.mimetype,
    );
  }
}
