import { Schema } from 'redis-om';

export const TagSchema = new Schema('Tag', {
  uuid: { type: 'string' },
  name: { type: 'string' },
});
