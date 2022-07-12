import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Paste } from './entities/paste.entity';
import { CommonService } from '../common/common.service';
import { GetPasteDto } from './dto/get-paste.dto';

@Injectable()
export class PastesService {
  constructor(
    @InjectRepository(Paste)
    private pasteRepo: Repository<Paste>,

    private readonly commonService: CommonService,
  ) {}
  async findOne(stringId: string): Promise<Paste> {
    const paste = await this.pasteRepo.findOne({
      where: {
        stringId,
      },
    });

    if (!paste) {
      throw new NotFoundException();
    }

    return paste;
  }

  async create(file: Express.Multer.File): Promise<GetPasteDto> {
    const paste = new Paste();

    paste.stringId = this.commonService.randomString();
    paste.deleteKey = this.commonService.randomString();
    paste.deletePass = this.commonService.randomString();

    paste.fileName = file.originalname;
    paste.content = file.buffer.toString('utf-8');
    paste.fileType = file.mimetype;

    await this.pasteRepo.save(paste);

    delete paste.content;

    return paste as GetPasteDto;
  }

  async findOneByDeleteKey(deleteKey: string): Promise<Paste> {
    const paste = await this.pasteRepo.findOne({
      where: {
        deleteKey,
      },
    });

    if (!paste) {
      throw new NotFoundException();
    }

    return paste;
  }

  async delete(deleteKey: string) {
    const result = await this.pasteRepo.delete({
      deleteKey,
    });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
}
