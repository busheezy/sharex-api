import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

@Injectable()
export class CommonService {
  randomString() {
    return nanoid();
  }
}
