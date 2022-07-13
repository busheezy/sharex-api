import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonConfigService } from '../common/common.config';
import { CommonService } from '../common/common.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { Link } from './entities/link.entity';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';

describe('LinksController', () => {
  let controller: LinksController;
  let service: LinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinksController],
      providers: [
        LinksService,
        CommonService,
        CommonConfigService,
        ConfigService,
        {
          provide: getRepositoryToken(Link),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<LinksController>(LinksController);
    service = module.get<LinksService>(LinksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should redirect to a url', async () => {
      const mockLink = new Link();
      mockLink.deleteKey = 'abcdef';
      mockLink.deletePass = 'ghijkl';
      mockLink.id = 0;
      mockLink.stringId = 'abcdef';
      mockLink.url = 'google.com';

      jest.spyOn(service, 'findOne').mockResolvedValue(mockLink);
      await expect(controller.findOne('abcdef')).resolves.toEqual({
        url: mockLink.url,
        statusCode: 301,
      });
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
      const mockCreateDto = new CreateLinkDto();
      mockCreateDto.url = 'google.com';

      const mockLink = new Link();
      mockLink.deleteKey = 'abcdef';
      mockLink.deletePass = 'ghijkl';
      mockLink.id = 0;
      mockLink.stringId = 'abcdef';
      mockLink.url = 'google.com';

      jest.spyOn(service, 'create').mockResolvedValue(mockLink);
      await expect(controller.create(mockCreateDto)).resolves.toBeInstanceOf(
        Link,
      );
    });
  });

  describe('deleteCode', () => {
    it('should return a paste by delete key', async () => {
      const mockLink = new Link();
      mockLink.deleteKey = 'abcdef';
      mockLink.deletePass = 'ghijkl';
      mockLink.id = 0;
      mockLink.stringId = 'abcdef';
      mockLink.url = 'google.com';

      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockLink);
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
      const mockLink = new Link();
      mockLink.deleteKey = 'abcdef';
      mockLink.deletePass = 'ghijkl';
      mockLink.id = 0;
      mockLink.stringId = 'abcdef';
      mockLink.url = 'google.com';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockLink);

      await expect(controller.delete('abcdef', 'ghijkl')).resolves.toBe(
        'Deleted',
      );
    });

    it('reject if missing password', async () => {
      const mockLink = new Link();
      mockLink.deleteKey = 'abcdef';
      mockLink.deletePass = 'ghijkl';
      mockLink.id = 0;
      mockLink.stringId = 'abcdef';
      mockLink.url = 'google.com';

      jest.spyOn(service, 'delete').mockResolvedValue();
      jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockLink);

      await expect(controller.delete('abcdef', '')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const mockLink = new Link();
        mockLink.deleteKey = 'abcdef';
        mockLink.deletePass = 'ghijkl';
        mockLink.id = 0;
        mockLink.stringId = 'abcdef';
        mockLink.url = 'google.com';

        jest
          .spyOn(service, 'delete')
          .mockRejectedValue(new NotFoundException());
        jest.spyOn(service, 'findOneByDeleteKey').mockResolvedValue(mockLink);

        await expect(
          controller.delete('mnopqr', 'ghijkl'),
        ).rejects.toBeInstanceOf(NotFoundException);
      });
    });
  });
});
