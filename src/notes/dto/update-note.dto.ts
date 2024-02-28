import { EditorBlock } from './create-note.dto';

export class UpdateNoteDto {
  noteId: string;
  blocks: EditorBlock[];
}
