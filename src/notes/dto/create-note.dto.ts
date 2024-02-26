type EditorBlock = {
  id: string;
  type: string;
  data: {
    text: string;
  };
};

export class CreateNoteDto {
  noteId: string;
  blocks: EditorBlock[];
}
