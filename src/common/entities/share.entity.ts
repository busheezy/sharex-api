import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class BaseShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stringId: string;

  @Column()
  deleteKey: string;

  @Column()
  deletePass: string;
}
