import { PartialType } from '@nestjs/mapped-types';
import { CreateShareDto } from './create-share.dto';

export class UpdateShareDto extends PartialType(CreateShareDto) {}
