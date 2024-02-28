import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'redis-om';

@Injectable()
export class RedisClientService
  extends Client
  implements OnModuleDestroy, OnModuleInit
{
  constructor(private readonly configService: ConfigService) {
    super();
  }

  public async onModuleInit() {
    await this.open(this.configService.get<string>('REDIS_CLOUD_URL'));
  }

  public async onModuleDestroy() {
    await this.close();
  }
}
