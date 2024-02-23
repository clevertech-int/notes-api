import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesGateway } from './notes.gateway';

@Module({
  providers: [NotesGateway, NotesService],
})
export class NotesModule {}
