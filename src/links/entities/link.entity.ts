import { Column, Entity } from 'typeorm';
import { BaseShare } from '../../common/entities/share.entity';

@Entity()
export class Link extends BaseShare {
  @Column()
  url: string;
}
