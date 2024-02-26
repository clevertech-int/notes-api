import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { RedisClientService } from '../redis-client/redis-client.service';
import { NoteSchema } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @Inject(RedisClientService)
    private readonly redisClient: RedisClientService,
  ) {}

  async onModuleInit() {
    await this.redisClient.open();
    const repo = await this.redisClient.fetchRepository(NoteSchema);
    await repo.createIndex();
  }

  create(createNoteDto: CreateNoteDto) {
    console.log('createNoteDto: ', createNoteDto.blocks);
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
