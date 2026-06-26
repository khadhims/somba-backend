import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OperationsService } from './operations.service';
import { Event } from '../entities/event.entity';
import { Alert } from '../entities/alert.entity';
import { MediaUrlService } from '../../../common/services/media-url.service';

describe('OperationsService', () => {
  let service: OperationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Alert),
          useValue: {},
        },
        {
          provide: MediaUrlService,
          useValue: {
            normalize: (url: string | null | undefined) => url,
          },
        },
      ],
    }).compile();

    service = module.get<OperationsService>(OperationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
