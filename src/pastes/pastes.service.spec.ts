import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Readable } from 'node:stream';
import { CommonService } from '../common/common.service';
import { createMockRepository, MockRepository } from '../common/mock.repo';
import { GetPasteDto } from './dto/get-paste.dto';
import { Paste } from './entities/paste.entity';
import { PastesService } from './pastes.service';

describe('PastesService', () => {
  let service: PastesService;
  let pasteRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PastesService,
        CommonService,
        {
          provide: getRepositoryToken(Paste),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<PastesService>(PastesService);
    pasteRepository = module.get<MockRepository>(getRepositoryToken(Paste));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(pasteRepository).toBeDefined();
  });

  describe('create', () => {
    describe('when creating a paste', () => {
      it('the paste should be created', async () => {
        const expectedPaste: Partial<GetPasteDto> = {
          fileName: 'fileName.txt',
          fileType: 'text/plain',
        };

        pasteRepository.save.mockReturnValue(expectedPaste);

        const mockFile: Express.Multer.File = {
          buffer: Buffer.from(''),
          destination: './',
          fieldname: 'file',
          filename: 'alksjdhfaksjdfhasfd',
          mimetype: 'text/plain',
          originalname: expectedPaste.fileName,
          path: './uploads/files/alksjdhfaksjdfhasfd',
          size: 123123,
          stream: new Readable(),
          encoding: 'utf-8',
        };

        const paste = await service.create(mockFile);

        expect(paste.fileName).toBe(expectedPaste.fileName);
        expect(paste.fileType).toBe(expectedPaste.fileType);
      });

      it('content should not be exposed on creation', async () => {
        const expectedPaste = {};

        pasteRepository.save.mockReturnValue(expectedPaste);

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

        const paste = (await service.create(mockFile)) as Paste;

        expect(paste.content).toBeUndefined();
      });
    });
  });

  describe('findOne', () => {
    describe('when paste with string ID exists', () => {
      it('should return the paste object', async () => {
        const pasteId = 'abcdefg';
        const expectedPaste = {};

        pasteRepository.findOne.mockReturnValue(expectedPaste);
        const paste = await service.findOne(pasteId);
        expect(paste).toBe(expectedPaste);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const pasteId = 'abcdefg';
        pasteRepository.findOne.mockReturnValue(undefined);

        try {
          await service.findOne(pasteId);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe('Not Found');
        }
      });
    });
  });

  describe('findOneByDeleteKey', () => {
    describe('when paste with delete key exists', () => {
      it('should return the paste object', async () => {
        const deleteKey = 'abcdefg';
        const expectedPaste = {};

        pasteRepository.findOne.mockReturnValue(expectedPaste);
        const paste = await service.findOneByDeleteKey(deleteKey);
        expect(paste).toBe(expectedPaste);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const deleteKey = 'abcdefg';
        pasteRepository.findOne.mockReturnValue(undefined);

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
        pasteRepository.delete.mockReturnValue({ affected: 1 });
        await service.delete(deleteKey);
        expect(pasteRepository.delete).toBeCalled();
      });
    });

    describe('otherwise', () => {
      it('it should explode', async () => {
        const deleteKey = 'abcdefg';

        pasteRepository.delete.mockRejectedValue(NotFoundException);
        pasteRepository.delete.mockReturnValue({ affected: 0 });

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
