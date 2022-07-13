import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Readable } from 'node:stream';
import { CommonService } from '../common/common.service';
import { createMockRepository, MockRepository } from '../common/mock.repo';
import { File } from './entities/file.entity';
import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService;
  let fileRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        CommonService,
        {
          provide: getRepositoryToken(File),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    fileRepository = module.get<MockRepository>(getRepositoryToken(File));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(fileRepository).toBeDefined();
  });

  describe('create', () => {
    describe('when creating a file', () => {
      it('the file should be created', async () => {
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

        const expectedFile: Partial<File> = {
          fileName: mockFile.originalname,
          fileType: mockFile.mimetype,
        };

        fileRepository.save.mockReturnValue(expectedFile);

        const file = await service.create(mockFile);

        expect(file.originalFileName).toBe(expectedFile.fileName);
        expect(file.fileType).toBe(expectedFile.fileType);
      });
    });
  });

  describe('findOne', () => {
    describe('when file with string ID exists', () => {
      it('should return the file object', async () => {
        const fileId = 'abcdefg';
        const expectedFile = {};

        fileRepository.findOne.mockReturnValue(expectedFile);
        const file = await service.findOne(fileId);
        expect(file).toBe(expectedFile);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const fileId = 'abcdefg';
        fileRepository.findOne.mockReturnValue(undefined);

        try {
          await service.findOne(fileId);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe('Not Found');
        }
      });
    });
  });

  describe('findOneByDeleteKey', () => {
    describe('when file with delete key exists', () => {
      it('should return the file object', async () => {
        const deleteKey = 'abcdefg';
        const expectedFile = {};

        fileRepository.findOne.mockReturnValue(expectedFile);
        const file = await service.findOneByDeleteKey(deleteKey);
        expect(file).toBe(expectedFile);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const deleteKey = 'abcdefg';
        fileRepository.findOne.mockReturnValue(undefined);

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
        const deleteKey = 'abcdefg';
        fileRepository.delete.mockReturnValue({ affected: 1 });
        await service.delete(deleteKey);
        expect(fileRepository.delete).toBeCalled();
      });
    });

    describe('otherwise', () => {
      it('it should explode', async () => {
        const deleteKey = 'abcdefg';

        fileRepository.delete.mockRejectedValue(NotFoundException);
        fileRepository.delete.mockReturnValue({ affected: 0 });

        try {
          await service.delete(deleteKey);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe('Not Found');
        }
      });
    });
  });
});
