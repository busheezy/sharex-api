import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  fileType: string;

  @Column()
  stringId: string;

  @Column()
  deleteUrl: string;

  @Column()
  deleteKey: string;
}
