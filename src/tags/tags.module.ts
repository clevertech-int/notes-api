import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsGateway } from './tags.gateway';
import { RedisClientModule } from '../redis-client/redis-client.module';

@Module({
  imports: [RedisClientModule],
  providers: [TagsGateway, TagsService],
})
export class TagsModule {}
