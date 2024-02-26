import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private readonly notesService: NotesService) {}

  handleConnection(client: any) {
    console.log('Client connected');
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected');
  }

  @SubscribeMessage('createNote')
  async create(@MessageBody() createNoteDto: CreateNoteDto) {
    const note = await this.notesService.create(createNoteDto);
    this.server.emit('noteCreated', note);
    // this.server.emit('findAllNotes', ['hello']);
  }

  @SubscribeMessage('findAllNotes')
  findAll() {
    return this.notesService.findAll();
  }

  @SubscribeMessage('findOneNote')
  findOne(@MessageBody() id: string) {
    console.log(id);
    return this.notesService.findOne(id);
  }

  @SubscribeMessage('updateNote')
  update(@MessageBody() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(updateNoteDto.id, updateNoteDto);
  }

  @SubscribeMessage('removeNote')
  remove(@MessageBody() id: number) {
    return this.notesService.remove(id);
  }
}
