import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
  HttpServer,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { ImagesModule } from '../../src/images/images.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Image } from '../../src/images/entities/image.entity';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

describe('[Feature] Images - /i', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ImagesModule,
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

  let image: Image;

  const imageToTestPath = join(process.cwd(), 'test', 'images', 'Test.png');
  const imageToTest = readFileSync(imageToTestPath);

  const imageToTestFailPath = join(
    process.cwd(),
    'test',
    'images',
    'Test2.png',
  );
  const imageToTestFail = readFileSync(imageToTestFailPath);

  const imageThumbnailToTestPath = join(
    process.cwd(),
    'test',
    'images',
    'Test-Thumbnail.png',
  );
  const imageThumbnailToTest = readFileSync(imageThumbnailToTestPath);

  const imageThumbnailToTestFailPath = join(
    process.cwd(),
    'test',
    'images',
    'Test2-Thumbnail.png',
  );
  const imageThumbnailToTestFail = readFileSync(imageThumbnailToTestFailPath);

  it('Create [POST /]', () => {
    return request(httpServer)
      .post('/i')
      .attach('image', imageToTest, {
        filename: 'Test.png',
        contentType: 'image/png',
      })
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        image = body as Image;
        expect(image.id).toBeDefined();
      });
  });

  it('FindOne [GET /:id]', () => {
    return request(httpServer)
      .get(`/i/${image.stringId}`)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toEqual(imageToTest);
        expect(body).not.toEqual(imageToTestFail);
      });
  });

  it('FindOne [GET /:id/thumbnail]', () => {
    return request(httpServer)
      .get(`/i/${image.stringId}/thumbnail`)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toEqual(imageThumbnailToTest);
        expect(body).not.toEqual(imageThumbnailToTestFail);
      });
  });

  it('FindOneByDeleteKey [GET /delete/:key]', () => {
    return request(httpServer)
      .get(`/i/delete/${image.deleteKey}`)
      .expect(HttpStatus.OK)
      .then(({ text }) => {
        expect(text).toBe(image.deletePass);
      });
  });

  it('Delete [GET /delete/:key/:pass]', () => {
    return request(httpServer)
      .get(`/i/delete/${image.deleteKey}/${image.deletePass}`)
      .expect(HttpStatus.OK)
      .then(({ text }) => {
        expect(text).toBe('Deleted');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
