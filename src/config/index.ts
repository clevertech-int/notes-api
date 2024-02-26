import { IConfig } from './spec/config.interface';

export function config(): IConfig {
  return {
    port: process.env.PORT ? +process.env.PORT : 1,
    redisUrl: process.env.REDIS_URL || 'asd',
  };
}

export { validationSchema } from './validation.schema';
