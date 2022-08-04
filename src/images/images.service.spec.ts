import { NotFoundException, StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Readable } from 'node:stream';
import { CommonService } from '../common/common.service';
import { createMockRepository, MockRepository } from '../common/mock.repo';
import { Image } from './entities/image.entity';
import { ImagesService } from './images.service';

jest.mock('node:fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(null),
}));

jest.mock('sharp', () =>
  jest.fn(function () {
    return {
      resize: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockReturnThis(),
    };
  }),
);

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn().mockResolvedValue(null),
}));

jest.mock('node:fs', () => ({
  createReadStream: jest.fn().mockReturnValue({ pipe: jest.fn() }),
}));

describe('ImagesService', () => {
  let service: ImagesService;
  let imageRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        CommonService,
        {
          provide: getRepositoryToken(Image),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    imageRepository = module.get<MockRepository>(getRepositoryToken(Image));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(imageRepository).toBeDefined();
  });

  it('should init module', async () => {
    const init = await service.onModuleInit();
    expect(init).toBe(undefined);
  });

  describe('create', () => {
    describe('when creating a image', () => {
      it('the image should be created', async () => {
        const mockImage: Express.Multer.File = {
          buffer: Buffer.from(''),
          destination: './',
          fieldname: 'image',
          filename: 'alksjdhfaksjdfhasfd',
          mimetype: 'text/plain',
          originalname: 'image.txt',
          path: './uploads/images/alksjdhfaksjdfhasfd',
          size: 123123,
          stream: new Readable(),
          encoding: 'utf-8',
        };

        const expectedImage: Partial<Image> = {
          fileName: mockImage.originalname,
          fileType: mockImage.mimetype,
        };

        jest.spyOn(imageRepository, 'save').mockReturnValue(expectedImage);

        const image = await service.create(mockImage);

        expect(image.originalFileName).toBe(expectedImage.fileName);
        expect(image.fileType).toBe(expectedImage.fileType);
      });
    });
  });

  describe('findOne', () => {
    describe('when image with string ID exists', () => {
      it('should return the image object', async () => {
        const imageId = 'abcdef';
        const expectedImage = {};

        jest.spyOn(imageRepository, 'findOne').mockReturnValue(expectedImage);
        const image = await service.findOne(imageId);
        expect(image).toBe(expectedImage);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const imageId = 'abcdef';
        jest.spyOn(imageRepository, 'findOne').mockReturnValue(undefined);

        try {
          await service.findOne(imageId);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe('Not Found');
        }
      });
    });
  });

  describe('findOneByDeleteKey', () => {
    describe('when image with delete key exists', () => {
      it('should return the image object', async () => {
        const deleteKey = 'abcdef';
        const expectedImage = {};

        jest.spyOn(imageRepository, 'findOne').mockReturnValue(expectedImage);
        const image = await service.findOneByDeleteKey(deleteKey);
        expect(image).toBe(expectedImage);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const deleteKey = 'abcdef';
        jest.spyOn(imageRepository, 'findOne').mockReturnValue(undefined);

        try {
          await service.findOneByDeleteKey(deleteKey);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe('Not Found');
        }
      });
    });
  });

  describe('delete', () => {
    describe('when deleting', () => {
      it('no errors', async () => {
        const deleteKey = 'abcdef';
        jest.spyOn(imageRepository, 'delete').mockReturnValue({ affected: 1 });
        await service.delete(deleteKey);
        expect(imageRepository.delete).toBeCalled();
      });
    });

    describe('otherwise', () => {
      it('it should explode', async () => {
        const deleteKey = 'abcdef';

        imageRepository.delete.mockRejectedValue(NotFoundException);
        imageRepository.delete.mockReturnValue({ affected: 0 });

        try {
          await service.delete(deleteKey);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe('Not Found');
        }
      });
    });

    describe('delete file', () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'abcdef';
      mockImage.deletePass = 'ghijkl';
      mockImage.fileName = 'fileName.png';
      mockImage.fileType = 'image/png';
      mockImage.id = 0;
      mockImage.stringId = 'abcdef';

      describe('when deleting image', () => {
        it('no errors', async () => {
          const deleteImage = await service.deleteImages(mockImage);
          expect(deleteImage).toBe(undefined);
        });
      });
    });

    describe('generate thumbnails', () => {
      const mockImage: Express.Multer.File = {
        buffer: Buffer.from(''),
        destination: './',
        fieldname: 'image',
        filename: 'alksjdhfaksjdfhasfd',
        mimetype: 'text/plain',
        originalname: 'image.txt',
        path: './uploads/images/alksjdhfaksjdfhasfd',
        size: 123123,
        stream: new Readable(),
        encoding: 'utf-8',
      };

      describe('when deleting image', () => {
        it('no errors', async () => {
          const generateThumbnail = await service.generateThumbnail(mockImage);
          expect(generateThumbnail).toBe(undefined);
        });
      });
    });

    describe('stream image', () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'abcdef';
      mockImage.deletePass = 'ghijkl';
      mockImage.fileName = 'fileName.png';
      mockImage.fileType = 'image/png';
      mockImage.id = 0;
      mockImage.stringId = 'abcdef';

      describe('when streaming file', () => {
        it('no errors', async () => {
          const deleteFile = service.streamImage(mockImage);
          expect(deleteFile).toBeInstanceOf(StreamableFile);
        });
      });
    });

    describe('stream thumbnail', () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'abcdef';
      mockImage.deletePass = 'ghijkl';
      mockImage.fileName = 'fileName.png';
      mockImage.fileType = 'image/png';
      mockImage.id = 0;
      mockImage.stringId = 'abcdef';

      describe('when streaming file', () => {
        it('no errors', async () => {
          const streamFile = service.streamImageThumbnail(mockImage);
          expect(streamFile).toBeInstanceOf(StreamableFile);
        });
      });
    });
  });
});
