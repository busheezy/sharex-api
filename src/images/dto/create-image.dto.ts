import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: Buffer;
}
