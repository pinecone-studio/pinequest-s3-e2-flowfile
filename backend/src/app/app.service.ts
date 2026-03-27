import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(@Optional() private readonly configService?: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getSupabaseUrl(): string | undefined {
    return this.configService?.get<string>('SUPABASE_URL');
  }
}
