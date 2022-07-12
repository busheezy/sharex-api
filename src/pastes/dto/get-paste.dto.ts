import { OmitType } from '@nestjs/swagger';
import { Paste } from '../entities/paste.entity';

export class GetPasteDto extends OmitType(Paste, ['content'] as const) {}
