import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class CreatePasteDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  paste: Express.Multer.File;
}
