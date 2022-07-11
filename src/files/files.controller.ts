import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('files')
@ApiTags('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id')
  findOne(@Param('id') stringId: string) {
    return this.filesService.findOne(stringId);
  }

  @Post()
  create(@Body() createFileDto: CreateFileDto) {
    return this.filesService.create(createFileDto);
  }
}
