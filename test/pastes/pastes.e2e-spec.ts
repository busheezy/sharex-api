import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
  HttpServer,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { PastesModule } from '../../src/pastes/pastes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Paste } from '../../src/pastes/entities/paste.entity';

describe('[Feature] Pastes - /p', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PastesModule,
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

  let paste: Paste;
  const pasteSz = 'hello';

  it('Create [POST /]', () => {
    return request(httpServer)
      .post('/p')
      .attach('paste', Buffer.from(pasteSz), {
        filename: 'test.txt',
        contentType: 'text/plain',
      })
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        paste = body as Paste;
        expect(paste.id).toBeDefined();
      });
  });

  it('FindOne [GET /:id]', () => {
    return request(httpServer)
      .get(`/p/${paste.stringId}`)
      .expect(HttpStatus.OK)
      .then(({ text }) => {
        expect(text).toBe(pasteSz);
      });
  });

  it('FindOneByDeleteKey [GET /delete/:key]', () => {
    return request(httpServer)
      .get(`/p/delete/${paste.deleteKey}`)
      .expect(HttpStatus.OK)
      .then(({ text }) => {
        expect(text).toBe(paste.deletePass);
      });
  });

  it('Delete [GET /delete/:key/:pass]', () => {
    return request(httpServer)
      .get(`/p/delete/${paste.deleteKey}/${paste.deletePass}`)
      .expect(HttpStatus.OK)
      .then(({ text }) => {
        expect(text).toBe('Deleted');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
