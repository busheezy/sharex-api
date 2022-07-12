import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseShare } from '../../common/entities/share.entity';

@Entity()
export class Paste extends BaseShare {
  @Column()
  @ApiProperty({
    description: 'The content of the paste.',
    example: 'Hello World!',
  })
  content: string;

  @Column()
  @ApiProperty({
    description: 'The name we saved the paste as.',
    example: '62b6907dcc130a3eb422fc169d2d4004',
  })
  fileName: string;

  @Column()
  @ApiProperty({
    description: 'The mime type of the paste.',
    example: 'text/plain',
  })
  fileType: string;
}
