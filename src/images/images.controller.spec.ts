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
      mockImage.deleteKey = 'abcdef';
      mockImage.deletePass = 'ghijkl';
      mockImage.fileName = 'fileName.png';
      mockImage.fileType = 'image/png';
      mockImage.id = 0;
      mockImage.stringId = 'abcdef';

      jest.spyOn(service, 'findOne').mockResolvedValue(mockImage);

      jest
        .spyOn(service, 'streamImage')
        .mockReturnValue(new StreamableFile(Buffer.from('')));

      expect(await controller.findOne('abcdef', mockRes)).toBeInstanceOf(
        StreamableFile,
      );
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest.spyOn(service, 'findOne').mockReturnValue(null);

        await expect(
          controller.findOne('abcdef', mockRes),
        ).rejects.toBeInstanceOf(NotFoundException);
      });
    });
  });

  describe('findOneThumbnail', () => {
    it('should return a image', async () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'abcdef';
      mockImage.deletePass = 'ghijkl';
      mockImage.fileName = 'fileName.png';
      mockImage.fileType = 'image/png';
      mockImage.id = 0;
      mockImage.stringId = 'abcdef';

      jest.spyOn(service, 'findOne').mockResolvedValue(mockImage);

      jest
        .spyOn(service, 'streamImageThumbnail')
        .mockReturnValue(new StreamableFile(Buffer.from('')));

      expect(
        await controller.findOneThumbnail('abcdef', mockRes),
      ).toBeInstanceOf(StreamableFile);
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest.spyOn(service, 'streamImageThumbnail').mockReturnValue(null);

        await expect(
          controller.findOne('abcdef', mockRes),
        ).rejects.toBeInstanceOf(TypeError);
      });

      it('should throw the "NotFoundException"', async () => {
        jest.spyOn(service, 'findOne').mockReturnValue(null);

        await expect(
          controller.findOne('abcdef', mockRes),
        ).rejects.toBeInstanceOf(NotFoundException);
      });
    });
  });

  describe('create', () => {
    it('should create a image', async () => {
      const image = new Image();
      image.deleteKey = 'abcdef';
      image.deletePass = 'ghijkl';
      image.fileName = 'fileName.png';
      image.fileType = 'text/plain';
      image.id = 0;
      image.stringId = 'abcdef';

      jest.spyOn(service, 'create').mockResolvedValue(image);
      jest.spyOn(service, 'generateThumbnail').mockResolvedValue();

      const mockImage: Express.Multer.File = {
        buffer: Buffer.from(''),
        destination: './',
        fieldname: 'image',
        filename: 'alksjdhfaksjdfhasfd',
        mimetype: 'image/png',
        originalname: 'fileName.png',
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
      mockImage.deleteKey = 'abcdef';
      mockImage.deletePass = 'ghijkl';
      mockImage.fileName = 'fileName.png';
      mockImage.fileType = 'image/png';
      mockImage.id = 0;
      mockImage.stringId = 'abcdef';

      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockImage);
      expect(await controller.deleteCode('abcdef')).toBe('ghijkl');
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest.spyOn(service, 'findOneByDeleteKey').mockReturnValue(null);

        await expect(controller.deleteCode('abcdef')).rejects.toBeInstanceOf(
          NotFoundException,
        );
      });
    });
  });

  describe('delete', () => {
    it('should delete image by delete key', async () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'abcdef';
      mockImage.deletePass = 'ghijkl';
      mockImage.fileName = 'fileName.png';
      mockImage.fileType = 'text/plain';
      mockImage.id = 0;
      mockImage.stringId = 'abcdef';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'deleteImages').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockImage);

      await expect(controller.delete('abcdef', 'ghijkl')).resolves.toBe(
        'Deleted',
      );
    });

    it('reject if missing password', async () => {
      const mockImage = new Image();
      mockImage.deleteKey = 'abcdef';
      mockImage.deletePass = 'ghijkl';
      mockImage.fileName = 'fileName.png';
      mockImage.fileType = 'text/plain';
      mockImage.id = 0;
      mockImage.stringId = 'abcdef';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockImage);

      await expect(controller.delete('abcdef', '')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest.spyOn(service, 'findOneByDeleteKey').mockReturnValue(null);

        await expect(
          controller.delete('mnopqr', 'ghijkl'),
        ).rejects.toBeInstanceOf(NotFoundException);
      });
    });
  });
});
