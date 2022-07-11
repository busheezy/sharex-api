import { Column, Index, PrimaryGeneratedColumn } from 'typeorm';

export class BaseShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  stringId: string;

  @Column()
  deleteKey: string;

  @Column()
  deletePass: string;
}
