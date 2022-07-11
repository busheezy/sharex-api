import { PickType } from '@nestjs/swagger';
import { Link } from '../entities/link.entity';

export class CreateLinkDto extends PickType(Link, ['url'] as const) {}
