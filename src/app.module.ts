import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation.schema';
import { config } from './config';
import { RedisClientModule } from './redis-client/redis-client.module';

@Module({
  imports: [
    RedisClientModule,
    NotesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [config],
    }),
  ],
})
export class AppModule {}
