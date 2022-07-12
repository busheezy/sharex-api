import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { ApiMovedPermanentlyResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';

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

    if (!link) {
      throw new NotFoundException();
    }

    return {
      url: link.url,
      statusCode: HttpStatus.MOVED_PERMANENTLY,
    };
  }

  @Post()
  @Auth()
  async create(@Body() createLinkDto: CreateLinkDto) {
    const link = await this.linksService.create(createLinkDto.url);

    if (!link) {
      throw new NotFoundException();
    }

    return link;
  }

  @Get('delete/:key')
  async deleteCode(@Param('key') key: string) {
    const link = await this.linksService.findOneByDeleteKey(key);

    if (!link) {
      throw new NotFoundException();
    }

    const { deletePass } = link;

    return deletePass;
  }

  @Get('delete/:key/:pass')
  async delete(@Param('key') key: string, @Param('pass') pass: string) {
    const link = await this.linksService.findOneByDeleteKey(key);

    if (!link) {
      throw new NotFoundException();
    }

    const { deletePass } = link;

    if (deletePass !== pass) {
      throw new ForbiddenException();
    }

    await this.linksService.delete(key);

    return 'Deleted';
  }
}
