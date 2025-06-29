import fastifyFormbody from '@fastify/formbody';
import { HttpServer, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AuthService } from '../../auth/auth.service';
import { CaslExceptionFilter } from '../../casl/casl.excecption.filter';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { HttpAdapterHost } from '@nestjs/core';
import { User } from '@prisma/client';

export async function initTest(): Promise<{
  app: NestFastifyApplication;
  admin: User & { accessToken: string; refreshToken: string };
  agent: User & { accessToken: string; refreshToken: string };
}> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter(), { bodyParser: false });
  app.enableCors();
  app.register(fastifyFormbody as any);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new CaslExceptionFilter());
  const httpAdapter: HttpServer = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const auth = app.get(AuthService);
  const admin = await auth.login('admin@test.com', '12345678');
  const agent = await auth.login('agent@test.com', '12345678');

  return { app, admin, agent };
}
