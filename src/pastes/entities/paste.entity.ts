import { Column, Entity } from 'typeorm';
import { BaseShare } from '../../common/entities/share.entity';

@Entity()
export class Paste extends BaseShare {
  @Column()
  fileName: string;

  @Column()
  content: string;

  @Column()
  contentType: string;
}
