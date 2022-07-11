import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Paste } from './entities/paste.entity';
import { CommonService } from '../common/common.service';

@Injectable()
export class PastesService {
  constructor(
    @InjectRepository(Paste)
    private pasteRepo: Repository<Paste>,

    private readonly commonService: CommonService,
  ) {}
  async findOne(stringId: string): Promise<string> {
    const paste = await this.pasteRepo.findOne({
      where: {
        stringId,
      },
    });

    return paste.content;
  }

  async create(
    fileName: string,
    content: Buffer,
    fileType: string,
  ): Promise<Paste> {
    const paste = new Paste();

    paste.stringId = this.commonService.randomString();
    paste.deleteKey = this.commonService.randomString();
    paste.deletePass = this.commonService.randomString();

    paste.fileName = fileName;
    paste.content = content.toString('utf-8');
    paste.contentType = fileType;

    await this.pasteRepo.insert(paste);

    return paste;
  }
}
