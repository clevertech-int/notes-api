import { Schema } from 'redis-om';

export const TagSchema = new Schema('Tag', {
  name: { type: 'string' },
});
