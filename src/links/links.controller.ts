import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { ApiMovedPermanentlyResponse, ApiTags } from '@nestjs/swagger';

@Controller('l')
@ApiTags('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get(':id')
  @Redirect()
  @HttpCode(HttpStatus.MOVED_PERMANENTLY)
  @ApiMovedPermanentlyResponse({
    description: 'We are redirecting to the stored url.',
  })
  async findOne(@Param('id') stringId: string) {
    const link = await this.linksService.findOne(stringId);

    return {
      url: link.url,
      statusCode: HttpStatus.MOVED_PERMANENTLY,
    };
  }

  @Post()
  create(@Body() createLinkDto: CreateLinkDto) {
    return this.linksService.create(createLinkDto.url);
  }
}
