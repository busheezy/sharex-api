import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Link } from '../../links/entities/link.entity';
import { Paste } from '../../pastes/entities/paste.entity';
import { File } from '../../files/entities/file.entity';
import { Image } from '../../images/entities/image.entity';

@Entity()
export class Share {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stringId: string;

  @Column()
  deleteUrl: string;

  @Column()
  deleteKey: string;

  @OneToOne(() => Paste)
  @JoinColumn()
  paste: Paste;

  @OneToOne(() => File)
  @JoinColumn()
  file: File;

  @OneToOne(() => Image)
  @JoinColumn()
  image: Image;

  @OneToOne(() => Link)
  @JoinColumn()
  link: Link;
}
