import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatusOk(): string {
    return 'OK';
  }
}
