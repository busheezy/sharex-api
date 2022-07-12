import { Injectable, NotFoundException } from '@nestjs/common';
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

    if (!link) {
      throw new NotFoundException();
    }

    return link;
  }

  async create(url: string): Promise<Link> {
    const link = new Link();

    link.stringId = this.commonService.randomString();
    link.deleteKey = this.commonService.randomString();
    link.deletePass = this.commonService.randomString();

    link.url = url;

    await this.linkRepo.save(link);

    return link;
  }

  async findOneByDeleteKey(deleteKey: string): Promise<Link> {
    const link = await this.linkRepo.findOne({
      where: {
        deleteKey,
      },
    });

    if (!link) {
      throw new NotFoundException();
    }

    return link;
  }

  async delete(deleteKey: string) {
    const result = await this.linkRepo.delete({
      deleteKey,
    });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
}
