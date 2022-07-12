import { ApiProperty } from '@nestjs/swagger';
import { Column, Index, PrimaryGeneratedColumn } from 'typeorm';

export class BaseShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  @ApiProperty({
    description: 'Unique string to identify share.',
    example: '22wh6F',
  })
  stringId: string;

  @Column()
  @ApiProperty({
    description: 'Unique string to start a deletion.',
    example: 'YHXjOt',
  })
  deleteKey: string;

  @Column()
  @ApiProperty({
    description: 'Unique string to confirm a deletion.',
    example: 'd9cMqV',
  })
  deletePass: string;
}
