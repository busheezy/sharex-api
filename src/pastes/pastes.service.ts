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

    private readonly commongService: CommonService,
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

    paste.deleteUrl = this.commongService.randomString();
    paste.deleteKey = this.commongService.randomString();
    paste.stringId = this.commongService.randomString();

    paste.fileName = fileName;
    paste.content = content.toString('utf-8');
    paste.contentType = fileType;

    await this.pasteRepo.insert(paste);

    return paste;
  }
}
