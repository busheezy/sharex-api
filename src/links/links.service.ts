import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../common/common.service';
import { Link } from './entities/link.entity';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linkRepo: Repository<Link>,

    private readonly commonService: CommonService,
  ) {}
  async findOne(stringId: string): Promise<Link> {
    const link = await this.linkRepo.findOne({
      where: {
        stringId,
      },
    });

    return link;
  }

  async create(url: string): Promise<Link> {
    const link = new Link();

    link.stringId = this.commonService.randomString();
    link.deleteKey = this.commonService.randomString();
    link.deletePass = this.commonService.randomString();

    link.url = url;

    await this.linkRepo.insert(link);

    return link;
  }

  findOneByDeleteKey(deleteKey: string): Promise<Link> {
    return this.linkRepo.findOne({
      where: {
        deleteKey,
      },
    });
  }

  delete(deleteKey: string) {
    return this.linkRepo.delete({
      deleteKey,
    });
  }
}
