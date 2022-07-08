import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PastesService } from './pastes.service';
import { CreatePasteDto } from './dto/create-paste.dto';
import { UpdatePasteDto } from './dto/update-paste.dto';

@Controller('pastes')
export class PastesController {
  constructor(private readonly pastesService: PastesService) {}

  @Post()
  create(@Body() createPasteDto: CreatePasteDto) {
    return this.pastesService.create(createPasteDto);
  }

  @Get()
  findAll() {
    return this.pastesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pastesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePasteDto: UpdatePasteDto) {
    return this.pastesService.update(+id, updatePasteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pastesService.remove(+id);
  }
}
