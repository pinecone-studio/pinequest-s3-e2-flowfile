import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const uploadsRoot = join(process.cwd(), 'uploads');
  const answerUploadsRoot = join(uploadsRoot, 'answers');

  if (!existsSync(answerUploadsRoot)) {
    mkdirSync(answerUploadsRoot, { recursive: true });
  }

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use('/uploads', express.static(uploadsRoot));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
