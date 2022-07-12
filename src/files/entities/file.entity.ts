import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseShare } from '../../common/entities/share.entity';

@Entity()
export class File extends BaseShare {
  @Column()
  @ApiProperty({
    description: 'The name the file had when it was uploaded.',
    example: 'test.zip',
  })
  originalFileName: string;

  @Column()
  @ApiProperty({
    description: 'The name we saved the file as.',
    example: '62b6907dcc130a3eb422fc169d2d4004',
  })
  fileName: string;

  @Column()
  @ApiProperty({
    description: 'The mime type of the file.',
    example: 'application/zip',
  })
  fileType: string;
}
