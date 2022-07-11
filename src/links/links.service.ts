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

    private readonly commongService: CommonService,
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

    link.deleteUrl = this.commongService.randomString();
    link.deleteKey = this.commongService.randomString();
    link.stringId = this.commongService.randomString();

    link.url = url;

    await this.linkRepo.insert(link);

    return link;
  }
}
