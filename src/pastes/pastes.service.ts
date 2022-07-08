import { Injectable } from '@nestjs/common';
import { CreatePasteDto } from './dto/create-paste.dto';
import { UpdatePasteDto } from './dto/update-paste.dto';

@Injectable()
export class PastesService {
  create(createPasteDto: CreatePasteDto) {
    return 'This action adds a new paste';
  }

  findAll() {
    return `This action returns all pastes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paste`;
  }

  update(id: number, updatePasteDto: UpdatePasteDto) {
    return `This action updates a #${id} paste`;
  }

  remove(id: number) {
    return `This action removes a #${id} paste`;
  }
}
