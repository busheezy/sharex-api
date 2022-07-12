import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseShare } from '../../common/entities/share.entity';

@Entity()
export class Image extends BaseShare {
  @Column()
  @ApiProperty({
    description: 'The name the image had when it was uploaded.',
    example: 'test.zip',
  })
  originalFileName: string;

  @Column()
  @ApiProperty({
    description: 'The name we saved the image as.',
    example: '62b6907dcc130a3eb422fc169d2d4004',
  })
  fileName: string;

  @Column()
  @ApiProperty({
    description: 'The mime type of the image.',
    example: 'image/jpeg',
  })
  fileType: string;
}
