import { Injectable } from '@nestjs/common';
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

    return paste;
  }

  async create(
    fileName: string,
    content: Buffer,
    fileType: string,
  ): Promise<GetPasteDto> {
    const paste = new Paste();

    paste.stringId = this.commonService.randomString();
    paste.deleteKey = this.commonService.randomString();
    paste.deletePass = this.commonService.randomString();

    paste.fileName = fileName;
    paste.content = content.toString('utf-8');
    paste.fileType = fileType;

    await this.pasteRepo.save(paste);

    delete paste.content;

    return paste as GetPasteDto;
  }

  findOneByDeleteKey(deleteKey: string): Promise<Paste> {
    return this.pasteRepo.findOne({
      where: {
        deleteKey,
      },
    });
  }

  delete(deleteKey: string) {
    return this.pasteRepo.delete({
      deleteKey,
    });
  }
}
