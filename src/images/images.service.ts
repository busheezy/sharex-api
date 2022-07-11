import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';

@Injectable()
export class ImagesService {
  create(createImageDto: CreateImageDto) {
    return 'This action adds a new image';
  }
}
