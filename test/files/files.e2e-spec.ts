import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
  HttpServer,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { FilesModule } from '../../src/files/files.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { File } from '../../src/files/entities/file.entity';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

describe('[Feature] Files - /f', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        FilesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'testing!',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
    httpServer = app.getHttpServer();
  });

  let file: File;

  const fileToTestPath = join(process.cwd(), 'test', 'files', 'Test.png');
  const fileToTest = readFileSync(fileToTestPath);

  const fileToTestFailPath = join(process.cwd(), 'test', 'files', 'Test2.png');
  const fileToTestFail = readFileSync(fileToTestFailPath);

  it('Create [POST /]', () => {
    return request(httpServer)
      .post('/f')
      .attach('file', fileToTest, {
        filename: 'Test.png',
        contentType: 'image/png',
      })
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        file = body as File;
        expect(file.id).toBeDefined();
      });
  });

  it('FindOne [GET /:id]', () => {
    return request(httpServer)
      .get(`/f/${file.stringId}`)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toEqual(fileToTest);
        expect(body).not.toEqual(fileToTestFail);
      });
  });

  it('FindOneByDeleteKey [GET /delete/:key]', () => {
    return request(httpServer)
      .get(`/f/delete/${file.deleteKey}`)
      .expect(HttpStatus.OK)
      .then(({ text }) => {
        expect(text).toBe(file.deletePass);
      });
  });

  it('Delete [GET /delete/:key/:pass]', () => {
    return request(httpServer)
      .get(`/f/delete/${file.deleteKey}/${file.deletePass}`)
      .expect(HttpStatus.OK)
      .then(({ text }) => {
        expect(text).toBe('Deleted');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
