import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getSupabaseUrl() {
    return this.configService.get<string>('SUPABASE_URL');
w  }
}
