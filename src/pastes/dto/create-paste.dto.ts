import { ApiProperty } from '@nestjs/swagger';

export class CreatePasteDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  paste: Buffer;
}
