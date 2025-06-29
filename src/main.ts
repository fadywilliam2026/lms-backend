import fastifyFormbody from '@fastify/formbody';
import { ValidationPipe, INestApplication, HttpServer } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { contentParser } from 'fastify-multer';
import { AppModule } from './app.module';
import { CaslExceptionFilter } from './casl/casl.excecption.filter';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { NestjsRedoxModule, NestJSRedoxOptions, RedocOptions } from 'nestjs-redox';
import * as fs from 'fs';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    bodyParser: false,
  });

  const PORT = process.env.PORT || 3000;
  app.enableCors();
  app.register(fastifyFormbody as any);
  app.register(contentParser as any);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new CaslExceptionFilter());
  const httpAdapter: HttpServer = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  swagger(app);

  await redoc(app);

  await app.listen(PORT, '0.0.0.0');

  console.info(`Swagger UI available at http://localhost:${PORT}/api`);
  console.info(`Partner Redoc available at http://localhost:${PORT}/partner-docs`);
}
bootstrap();

export function swagger(app: INestApplication) {
  if (process.env.NODE_ENV === 'production') return;
  const config = new DocumentBuilder()
    .setTitle('LMS')
    .setDescription('The LMS API documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

export async function redoc(app: INestApplication) {
  const fileDirectory = './markdown-files/';
  const fileExtensions = fs.readdirSync(fileDirectory).map(file => {
    const content = fs.readFileSync(`${fileDirectory}${file}`, 'utf8');
    return {
      name: file,
      content,
    };
  });

  const redocConfig = new DocumentBuilder()
    .setTitle('Partner API Documentation')
    .setDescription(fileExtensions.map(file => file.content).join('\n\n'))
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurity('roles', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();

  const document = SwaggerModule.createDocument(app, redocConfig, {
    ignoreGlobalPrefix: false,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  const partnerPaths = [
    '/auth/login',
    '/auth/refreshToken',
    '/clients/nationalId/{nationalId}',
    '/clients/createClientFromPartner',
    '/loans/simple-loan',
    '/users/webhook',
  ];

  const filterPath: Record<string, any> = {};
  partnerPaths.forEach(path => {
    if (document.paths[path]) {
      filterPath[path] = document.paths[path];
    } else {
      console.warn(`Path "${path}" not found in the Swagger document.`);
    }
  });

  const partnerDocument: OpenAPIObject = {
    ...document,
    paths: filterPath,
  };

  const redocOptions: RedocOptions = {
    requiredPropsFirst: true,
    logo: {
      url: 'https://flend.io/wp-content/uploads/2023/03/FlendLogo.png',
      altText: 'Flend.io',
    },
    theme: {
      sidebar: {
        backgroundColor: '#253237',
        textColor: '#ffffff',
        width: '300px',
        level1Items: {
          textTransform: 'uppercase',
        },
      },
      typography: {
        fontSize: '18px',
        headings: {
          lineHeight: '1.5',
        },
      },
      colors: {
        primary: {
          main: '#0F7E5B',
        },
      },
      logo: {
        gutter: '20px',
      },
    },
  };

  const redoxOptions: NestJSRedoxOptions = {
    useGlobalPrefix: true,
    disableGoogleFont: true,
    standalone: true,
  };

  NestjsRedoxModule.setup('partner-docs', app, partnerDocument, redoxOptions, redocOptions);
}
