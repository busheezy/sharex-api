import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Paste {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  content: string;

  @Column()
  contentType: string;

  @Column()
  stringId: string;

  @Column()
  deleteUrl: string;

  @Column()
  deleteKey: string;
}
