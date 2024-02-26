import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesGateway } from './notes.gateway';
import { RedisClientModule } from '../redis-client/redis-client.module';

@Module({
  imports: [RedisClientModule],
  providers: [NotesGateway, NotesService],
})
export class NotesModule {}
