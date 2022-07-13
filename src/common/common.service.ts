import { Injectable } from '@nestjs/common';

import { customAlphabet } from 'nanoid';
import { nolookalikes } from 'nanoid-dictionary';

const nanoid = customAlphabet(nolookalikes, 6);

@Injectable()
export class CommonService {
  randomString() {
    return nanoid();
  }
}
