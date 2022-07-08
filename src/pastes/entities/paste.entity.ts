import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Paste {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  contentType: string;
}
