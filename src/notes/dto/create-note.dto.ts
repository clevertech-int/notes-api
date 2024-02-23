type EditorBlock = {
  type: string;
  data: {
    text: string;
  };
};

export class CreateNoteDto {
  blocks: EditorBlock[];
}
