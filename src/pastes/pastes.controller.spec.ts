import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonConfigService } from '../common/common.config';
import { CommonService } from '../common/common.service';
import { GetPasteDto } from './dto/get-paste.dto';
import { Paste } from './entities/paste.entity';
import { PastesController } from './pastes.controller';
import { PastesService } from './pastes.service';
import { Readable } from 'node:stream';

describe('PastesController', () => {
  let controller: PastesController;
  let service: PastesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PastesController],
      providers: [
        PastesService,
        CommonService,
        CommonConfigService,
        ConfigService,
        {
          provide: getRepositoryToken(Paste),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PastesController>(PastesController);
    service = module.get<PastesService>(PastesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a paste', async () => {
      const pasteSample = new Paste();
      pasteSample.deleteKey = 'abcdef';
      pasteSample.deletePass = 'ghijkl';
      pasteSample.fileName = 'fileName.txt';
      pasteSample.fileType = 'text/plain';
      pasteSample.id = 0;
      pasteSample.stringId = 'abcdef';
      pasteSample.content = 'bird';

      jest.spyOn(service, 'findOne').mockResolvedValue(pasteSample);
      expect(await controller.findOne('abcdef')).toBe('bird');
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest
          .spyOn(service, 'findOne')
          .mockRejectedValue(new NotFoundException());

        await expect(controller.findOne('abcdef')).rejects.toBeInstanceOf(
          NotFoundException,
        );
      });
    });
  });

  describe('create', () => {
    it('should create a paste', async () => {
      const pasteSample = new GetPasteDto();
      pasteSample.deleteKey = 'abcdef';
      pasteSample.deletePass = 'ghijkl';
      pasteSample.fileName = 'fileName.txt';
      pasteSample.fileType = 'text/plain';
      pasteSample.id = 0;
      pasteSample.stringId = 'abcdef';

      jest.spyOn(service, 'create').mockResolvedValue(pasteSample);

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

      await expect(controller.create(mockFile)).resolves.toBeInstanceOf(
        GetPasteDto,
      );
    });
  });

  describe('deleteCode', () => {
    it('should return a paste by delete key', async () => {
      const pasteSample = new Paste();
      pasteSample.deleteKey = 'abcdef';
      pasteSample.deletePass = 'ghijkl';
      pasteSample.fileName = 'fileName.txt';
      pasteSample.fileType = 'text/plain';
      pasteSample.id = 0;
      pasteSample.stringId = 'abcdef';
      pasteSample.content = 'bird';

      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(pasteSample);

      expect(await controller.deleteCode('abcdef')).toBe('ghijkl');
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        jest
          .spyOn(service, 'findOneByDeleteKey')
          .mockRejectedValue(new NotFoundException());

        await expect(controller.deleteCode('abcdef')).rejects.toBeInstanceOf(
          NotFoundException,
        );
      });
    });
  });

  describe('delete', () => {
    it('should delete a paste by delete key', async () => {
      const pasteSample = new Paste();
      pasteSample.deleteKey = 'abcdef';
      pasteSample.deletePass = 'ghijkl';
      pasteSample.fileName = 'fileName.txt';
      pasteSample.fileType = 'text/plain';
      pasteSample.id = 0;
      pasteSample.stringId = 'abcdef';
      pasteSample.content = 'bird';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(pasteSample);

      await expect(controller.delete('abcdef', 'ghijkl')).resolves.toBe(
        'Deleted',
      );
    });

    it('reject if missing password', async () => {
      const pasteSample = new Paste();
      pasteSample.deleteKey = 'abcdef';
      pasteSample.deletePass = 'ghijkl';
      pasteSample.fileName = 'fileName.txt';
      pasteSample.fileType = 'text/plain';
      pasteSample.id = 0;
      pasteSample.stringId = 'abcdef';
      pasteSample.content = 'bird';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(pasteSample);

      await expect(controller.delete('abcdef', '')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const pasteSample = new Paste();
        pasteSample.deleteKey = 'abcdef';
        pasteSample.deletePass = 'ghijkl';
        pasteSample.fileName = 'fileName.txt';
        pasteSample.fileType = 'text/plain';
        pasteSample.id = 0;
        pasteSample.stringId = 'abcdef';
        pasteSample.content = 'bird';

        jest
          .spyOn(service, 'delete')
          .mockRejectedValue(new NotFoundException());
        jest
          .spyOn(service, 'findOneByDeleteKey')
          .mockResolvedValue(pasteSample);

        await expect(
          controller.delete('mnopqr', 'ghijkl'),
        ).rejects.toBeInstanceOf(NotFoundException);
      });
    });
  });
});
