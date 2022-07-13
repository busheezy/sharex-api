import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
  HttpServer,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { LinksModule } from '../../src/links/links.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Link } from '../../src/links/entities/link.entity';

describe('[Feature] Links - /p', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        LinksModule,
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

  let link: Link;
  const linkSz = 'google.com';

  it('Create [POST /]', () => {
    return request(httpServer)
      .post('/l')
      .send({
        url: linkSz,
      })
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        link = body as Link;
        expect(link.id).toBeDefined();
      });
  });

  it('FindOne [GET /:id]', () => {
    return request(httpServer)
      .get(`/l/${link.stringId}`)
      .expect(HttpStatus.MOVED_PERMANENTLY)
      .then(({ headers }) => {
        expect(headers.location).toBe(linkSz);
      });
  });

  it('FindOneByDeleteKey [GET /delete/:key]', () => {
    return request(httpServer)
      .get(`/l/delete/${link.deleteKey}`)
      .expect(HttpStatus.OK)
      .then(({ text }) => {
        expect(text).toBe(link.deletePass);
      });
  });

  it('Delete [GET /delete/:key/:pass]', () => {
    return request(httpServer)
      .get(`/l/delete/${link.deleteKey}/${link.deletePass}`)
      .expect(HttpStatus.OK)
      .then(({ text }) => {
        expect(text).toBe('Deleted');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
