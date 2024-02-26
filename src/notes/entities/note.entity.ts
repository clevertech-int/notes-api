import { Entity, Schema } from 'redis-om';

export class Note {
  body: string;
}

export const NoteSchema = new Schema('Note', {
  body: { type: 'string' },
});
