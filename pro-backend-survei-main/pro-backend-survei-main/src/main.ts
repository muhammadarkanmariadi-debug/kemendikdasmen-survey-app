import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ROOT_DIRECTORY } from './global';
import { join } from 'path';
import * as express from "express";
import helmet from 'helmet';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
  app.use(compression());
  app.enableCors();
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  
  const configDocument = new DocumentBuilder()
    .setTitle(`Survei SPMB`)
    .setDescription(`Ini adalah project kerja bakti dari direktorat kementerian`)
    .setVersion(`1.0`)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token'
    )
    .addBasicAuth()
    .build()

  const document = SwaggerModule.createDocument(app, configDocument)
  SwaggerModule.setup(`/api/docs`, app, document)
  app.use(`/file-documentations`, express.static(join(ROOT_DIRECTORY, `public`, `documentations`)))
  app.use(`/file-documents`, express.static(join(ROOT_DIRECTORY, `public`, `documents`)))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
