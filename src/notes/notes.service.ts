import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
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
