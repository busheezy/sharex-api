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
import { File } from './entities/file.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { Readable } from 'node:stream';

const mockRes = {
  set: jest.fn(),
};

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        FilesService,
        CommonService,
        CommonConfigService,
        ConfigService,
        {
          provide: getRepositoryToken(File),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a file', async () => {
      const mockFile = new File();
      mockFile.deleteKey = 'a';
      mockFile.deletePass = 'b';
      mockFile.fileName = 'c.txt';
      mockFile.fileType = 'text/plain';
      mockFile.id = 0;
      mockFile.stringId = 'abcdefg';

      jest.spyOn(service, 'findOne').mockResolvedValue(mockFile);

      jest
        .spyOn(service, 'streamFile')
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

  describe('create', () => {
    it('should create a file', async () => {
      const file = new File();
      file.deleteKey = 'a';
      file.deletePass = 'b';
      file.fileName = 'c.txt';
      file.fileType = 'text/plain';
      file.id = 0;
      file.stringId = 'abcdefg';

      jest.spyOn(service, 'create').mockResolvedValue(file);

      const mockFile: Express.Multer.File = {
        buffer: Buffer.from(''),
        destination: './',
        fieldname: 'file',
        filename: 'alksjdhfaksjdfhasfd',
        mimetype: 'text/plain',
        originalname: 'file.txt',
        path: './uploads/files/alksjdhfaksjdfhasfd',
        size: 123123,
        stream: new Readable(),
        encoding: 'utf-8',
      };

      await expect(controller.create(mockFile)).resolves.toBeInstanceOf(File);
    });
  });

  describe('deleteCode', () => {
    it('should return a file by delete key', async () => {
      const mockFile = new File();
      mockFile.deleteKey = 'a';
      mockFile.deletePass = 'b';
      mockFile.fileName = 'c.txt';
      mockFile.fileType = 'text/plain';
      mockFile.id = 0;
      mockFile.stringId = 'abcdefg';

      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockFile);
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
    it('should return a file by delete key', async () => {
      const mockFile = new File();
      mockFile.deleteKey = 'a';
      mockFile.deletePass = 'b';
      mockFile.fileName = 'c.txt';
      mockFile.fileType = 'text/plain';
      mockFile.id = 0;
      mockFile.stringId = 'abcdefg';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'deleteFile').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockFile);
      await expect(controller.delete('abcdefg', 'b')).resolves.toBe('Deleted');
    });

    it('reject if missing password', async () => {
      const mockFile = new File();
      mockFile.deleteKey = 'a';
      mockFile.deletePass = 'b';
      mockFile.fileName = 'c.txt';
      mockFile.fileType = 'text/plain';
      mockFile.id = 0;
      mockFile.stringId = 'abcdefg';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockFile);
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
