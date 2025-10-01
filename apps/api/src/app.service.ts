import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Physio-Doctor Platform API is running!';
  }
}
