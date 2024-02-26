import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { RedisClientService } from '../redis-client/redis-client.service';
import { NoteBlockSchema, NoteSchema } from './entities/note.entity';
import { Repository } from 'redis-om';

@Injectable()
export class NotesService implements OnModuleInit {
  private notesReposiotry: Repository;
  private noteBlocksRepository: Repository;

  constructor(
    @Inject(RedisClientService)
    private readonly redisClient: RedisClientService,
  ) {}

  async onModuleInit() {
    await this.redisClient.open();
    this.notesReposiotry = await this.redisClient.fetchRepository(NoteSchema);
    this.noteBlocksRepository = await this.redisClient.fetchRepository(
      NoteBlockSchema,
    );
    await this.notesReposiotry.createIndex();
    await this.noteBlocksRepository.createIndex();
  }

  async create(createNoteDto: CreateNoteDto) {
    const { noteId } = createNoteDto;
    for (const block of createNoteDto.blocks) {
      const { id } = block;
      const hit = await this.noteBlocksRepository
        .search()
        .where('id')
        .equals(id)
        .return.first();

      if (hit) {
        hit.body = block.data.text;
        await this.noteBlocksRepository.save(hit);
      } else {
        await this.noteBlocksRepository.save({
          noteId,
          id: block.id,
          body: block.data.text,
        });
      }
    }
    return createNoteDto;
  }

  findAll() {
    return [
      {
        id: '1',
        title: 'First Note',
      },
      {
        id: '2',
        title: 'Second Note',
      },
    ];
  }

  findOne(id: string) {
    return `This action returns a #${id} note`;
  }

  update(id: number, updateNoteDto: UpdateNoteDto) {
    return `This action updates a #${id} note`;
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }
}
