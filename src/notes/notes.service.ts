import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { RedisClientService } from '../redis-client/redis-client.service';
import { NoteBlockSchema, NoteSchema } from './entities/note.entity';
import { Repository } from 'redis-om';
import ShortUniqueId from 'short-unique-id';

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
    const { randomUUID } = new ShortUniqueId({ length: 10 });
    const id = randomUUID();
    const note = await this.notesReposiotry.save({
      id,
      title: id,
      author: 'anonymous',
    });

    return note;
  }

  findAll() {
    return this.notesReposiotry.search().return.all();
  }

  search(uuid: string) {
    return this.noteBlocksRepository
      .search()
      .where('body')
      .matches(uuid)
      .return.all();
  }

  async findOne(id: string) {
    const blocks = await this.noteBlocksRepository
      .search()
      .where('noteId')
      .equals(id)
      .return.all();

    if (blocks.length === 0) {
      return {
        noteId: id,
        time: 1708948242966,
        blocks: [],
        version: '2.29.0',
      };
    }

    const formattedBlocks = blocks.map((block) => {
      return {
        id: block.id,
        type: 'paragraph',
        data: {
          text: block.body,
        },
      };
    });

    return {
      noteId: id,
      time: 1708948242966,
      blocks: formattedBlocks,
      version: '2.29.0',
    };
  }

  async update(noteId: string, updateNoteDto: UpdateNoteDto) {
    for (const block of updateNoteDto.blocks) {
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
          id,
          noteId,
          body: block.data.text,
        });
      }
    }
    return updateNoteDto;
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }
}
