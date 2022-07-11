import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  stringId: string;

  @Column()
  deleteUrl: string;

  @Column()
  deleteKey: string;
}
