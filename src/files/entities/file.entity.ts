import { Column, Entity } from 'typeorm';
import { BaseShare } from '../../common/entities/share.entity';

@Entity()
export class File extends BaseShare {
  @Column()
  originalFileName: string;

  @Column()
  fileName: string;

  @Column()
  fileType: string;
}
