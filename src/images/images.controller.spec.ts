import {
  ForbiddenException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonConfigService } from '../common/common.config';
import { CommonService } from '../common/common.service';
import { Image } from './entities/image.entity';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { Readable } from 'node:stream';

const mockRes = {
  set: jest.fn(),
};

describe('ImagesController', () => {
  let controller: ImagesController;
  let service: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        ImagesService,
        CommonService,
        CommonConfigService,
        ConfigService,
        {
          provide: getRepositoryToken(Image),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    service = module.get<ImagesService>(ImagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a image', async () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'a';
      mockImage.deletePass = 'b';
      mockImage.fileName = 'c.txt';
      mockImage.fileType = 'text/plain';
      mockImage.id = 0;
      mockImage.stringId = 'abcdefg';

      jest.spyOn(service, 'findOne').mockResolvedValue(mockImage);

      jest
        .spyOn(service, 'streamImage')
        .mockReturnValue(new StreamableFile(Buffer.from('')));

      expect(await controller.findOne('abcdefg', mockRes)).toBeInstanceOf(
        StreamableFile,
      );
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest
          .spyOn(service, 'findOne')
          .mockRejectedValue(new NotFoundException());

        await expect(
          controller.findOne('abcdefg', mockRes),
        ).rejects.toBeInstanceOf(NotFoundException);
      });
    });
  });

  describe('findOneThumbnail', () => {
    it('should return a image', async () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'a';
      mockImage.deletePass = 'b';
      mockImage.fileName = 'c.txt';
      mockImage.fileType = 'text/plain';
      mockImage.id = 0;
      mockImage.stringId = 'abcdefg';

      jest.spyOn(service, 'findOne').mockResolvedValue(mockImage);

      jest
        .spyOn(service, 'streamImageThumbnail')
        .mockReturnValue(new StreamableFile(Buffer.from('')));

      expect(
        await controller.findOneThumbnail('abcdefg', mockRes),
      ).toBeInstanceOf(StreamableFile);
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest
          .spyOn(service, 'findOne')
          .mockRejectedValue(new NotFoundException());

        await expect(
          controller.findOne('abcdefg', mockRes),
        ).rejects.toBeInstanceOf(NotFoundException);
      });
    });
  });

  describe('create', () => {
    it('should create a image', async () => {
      const image = new Image();
      image.deleteKey = 'a';
      image.deletePass = 'b';
      image.fileName = 'c.txt';
      image.fileType = 'text/plain';
      image.id = 0;
      image.stringId = 'abcdefg';

      jest.spyOn(service, 'create').mockResolvedValue(image);
      jest.spyOn(service, 'generateThumbnail').mockResolvedValue();

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

      await expect(controller.create(mockImage)).resolves.toBeInstanceOf(Image);
    });
  });

  describe('deleteCode', () => {
    it('should return a image by delete key', async () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'a';
      mockImage.deletePass = 'b';
      mockImage.fileName = 'c.txt';
      mockImage.fileType = 'text/plain';
      mockImage.id = 0;
      mockImage.stringId = 'abcdefg';

      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockImage);
      expect(await controller.deleteCode('abcdefg')).toBe('b');
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest
          .spyOn(service, 'findOneByDeleteKey')
          .mockRejectedValue(new NotFoundException());

        await expect(controller.deleteCode('abcdefg')).rejects.toBeInstanceOf(
          NotFoundException,
        );
      });
    });
  });

  describe('delete', () => {
    it('should return a image by delete key', async () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'a';
      mockImage.deletePass = 'b';
      mockImage.fileName = 'c.txt';
      mockImage.fileType = 'text/plain';
      mockImage.id = 0;
      mockImage.stringId = 'abcdefg';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'deleteImages').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockImage);
      await expect(controller.delete('abcdefg', 'b')).resolves.toBe('Deleted');
    });

    it('reject if missing password', async () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'a';
      mockImage.deletePass = 'b';
      mockImage.fileName = 'c.txt';
      mockImage.fileType = 'text/plain';
      mockImage.id = 0;
      mockImage.stringId = 'abcdefg';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockImage);
      await expect(
        controller.delete('abcdefg', 'asdfas'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest
          .spyOn(service, 'findOneByDeleteKey')
          .mockRejectedValue(new NotFoundException());

        await expect(controller.delete('aasdf', 'b')).rejects.toBeInstanceOf(
          NotFoundException,
        );
      });
    });
  });
});
