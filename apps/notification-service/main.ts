/*
 * The MIT License
 *
 * Copyright 2026 Juliano Maciel.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {

  const appContext = await NestFactory.createApplicationContext(AppModule);

  const configService = appContext.get(ConfigService);

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${configService.get('RABBITMQ_USER')}:${configService.get('RABBITMQ_PASS')}@${configService.get('RABBITMQ_HOST')}:${configService.get('RABBITMQ_PORT')}`],
        queue: 'notification_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  const options = new DocumentBuilder()
    .setTitle('Notification Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  if (process.env.GENERATE_SWAGGER === 'true') {

    const docApp = await NestFactory.create(AppModule);

    const document = SwaggerModule.createDocument(docApp, options);

    const outDir = process.env.SWAGGER_OUT_DIR || path.resolve(__dirname, '../docs-aggregator/docs');

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outDir, 'notification-service.json'),
      JSON.stringify(document, null, 2)
    );

    await docApp.close();

    await appContext.close();

    process.exit(0);
  }

  await microservice.listen();

  console.log('Notification service is listening');
}
bootstrap();
