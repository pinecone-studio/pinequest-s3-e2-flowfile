import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://e-shalgalt.vercel.app',
  'https://seedcone.vercel.app',
];
const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/$/, '').toLowerCase();
}

function getAllowedOrigins() {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
  ]
    .flatMap((value) => (value ? value.split(',') : []))
    .map((value) => normalizeOrigin(value))
    .filter(Boolean);

  return new Set(
    [...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins].map((value) =>
      normalizeOrigin(value),
    ),
  );
}

function resolveCorsOrigin(
  origin: string | undefined,
  allowedOrigins: Set<string>,
) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (LOCAL_ORIGIN_PATTERN.test(normalizedOrigin)) {
    return origin;
  }

  return allowedOrigins.has(normalizedOrigin) ? origin : false;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const uploadsRoot = join(process.cwd(), 'uploads');
  const answerUploadsRoot = join(uploadsRoot, 'answers');
  const allowedOrigins = getAllowedOrigins();

  if (!existsSync(answerUploadsRoot)) {
    mkdirSync(answerUploadsRoot, { recursive: true });
  }

  app.enableCors({
    origin: (origin, callback) => {
      const resolvedOrigin = resolveCorsOrigin(origin, allowedOrigins);

      if (resolvedOrigin) {
        callback(null, resolvedOrigin);
        return;
      }

      callback(new Error(`Origin ${origin ?? 'unknown'} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Cache-Control',
      'Pragma',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Type', 'Cache-Control'],
    optionsSuccessStatus: 204,
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
