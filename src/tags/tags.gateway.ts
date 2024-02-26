import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';

@WebSocketGateway()
export class TagsGateway {
  constructor(private readonly tagsService: TagsService) {}

  @SubscribeMessage('createTag')
  create(@MessageBody() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @SubscribeMessage('findAllTags')
  findAll() {
    return this.tagsService.findAll();
  }
}
