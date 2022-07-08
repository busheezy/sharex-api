import { PartialType } from '@nestjs/mapped-types';
import { CreatePasteDto } from './create-paste.dto';

export class UpdatePasteDto extends PartialType(CreatePasteDto) {}
