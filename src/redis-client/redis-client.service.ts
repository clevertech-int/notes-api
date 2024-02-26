import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'redis-om';
import { createClient } from 'redis';

@Injectable()
export class RedisClientService extends Client implements OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    super();
    // (async () => {
    // const connection = createClient();
    // await connection.connect();
    // this.use(connection);
    // this.open();
    // })();
  }

  public async onModuleDestroy() {
    await this.close();
  }
}
