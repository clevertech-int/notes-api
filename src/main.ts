import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
const httpsOptions = {
  key: fs.readFileSync('./secrets/server.key'),
  cert: fs.readFileSync('./secrets/server.cert'),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  await app.listen(8081);

  console.log(`Running on port: ${await app.getUrl()}`);
}
bootstrap();
