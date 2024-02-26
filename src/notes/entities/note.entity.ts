import { Schema } from 'redis-om';

export const NoteSchema = new Schema('Note', {
  id: { type: 'string' },
  title: { type: 'string' },
  author: { type: 'string' },
  // we might want to persis the order of blocks in here as well ..
});

export const NoteBlockSchema = new Schema('NoteBlock', {
  id: { type: 'string' },
  noteId: { type: 'string' },
  type: { type: 'string' },
  body: { type: 'text' },
});
