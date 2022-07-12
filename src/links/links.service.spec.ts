import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonService } from '../common/common.service';
import { createMockRepository, MockRepository } from '../common/mock.repo';
import { Link } from './entities/link.entity';
import { LinksService } from './links.service';

describe('LinksService', () => {
  let service: LinksService;
  let linkRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        CommonService,
        {
          provide: getRepositoryToken(Link),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
    linkRepository = module.get<MockRepository>(getRepositoryToken(Link));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    describe('when creating a link', () => {
      it('the link should be created', async () => {
        const mockLink: Link = {
          deleteKey: 'a',
          deletePass: 'b',
          id: 0,
          stringId: 'abcdef',
          url: 'http://www.google.com',
        };

        linkRepository.save.mockReturnValue(mockLink);

        const link = await service.create(mockLink.url);

        expect(link.url).toEqual(mockLink.url);
      });
    });
  });

  describe('findOne', () => {
    describe('when link with string ID exists', () => {
      it('should return the file object', async () => {
        const mockLink: Link = {
          deleteKey: 'a',
          deletePass: 'b',
          id: 0,
          stringId: 'abcdef',
          url: 'http://www.google.com',
        };

        linkRepository.findOne.mockReturnValue(mockLink);
        const link = await service.findOne(mockLink.stringId);
        expect(link).toEqual(mockLink);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const linkId = 'abcdefg';
        linkRepository.findOne.mockReturnValue(undefined);

        try {
          await service.findOne(linkId);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual('Not Found');
        }
      });
    });
  });

  describe('findOneByDeleteKey', () => {
    describe('when link with delete key exists', () => {
      it('should return the link object', async () => {
        const deleteKey = 'abcdefg';
        const mockLink = {};

        linkRepository.findOne.mockReturnValue(mockLink);
        const link = await service.findOneByDeleteKey(deleteKey);
        expect(link).toEqual(mockLink);
      });
    });

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const deleteKey = 'abcdefg';
        linkRepository.findOne.mockReturnValue(undefined);

        try {
          await service.findOneByDeleteKey(deleteKey);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual('Not Found');
        }
      });
    });
  });

  describe('delete', () => {
    describe('when deleting', () => {
      it('no errors', async () => {
        const deleteKey = 'abcdefg';
        linkRepository.delete.mockReturnValue({ affected: 1 });
        await service.delete(deleteKey);
        expect(linkRepository.delete).toBeCalled();
      });
    });

    describe('otherwise', () => {
      it('it should explode', async () => {
        const deleteKey = 'abcdefg';

        linkRepository.delete.mockRejectedValue(NotFoundException);
        linkRepository.delete.mockReturnValue({ affected: 0 });

        try {
          await service.delete(deleteKey);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual('Not Found');
        }
      });
    });
  });
});
