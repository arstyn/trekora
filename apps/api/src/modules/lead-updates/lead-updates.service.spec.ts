import { Test, TestingModule } from '@nestjs/testing';
import { LeadUpdatesService } from './lead-updates.service';

describe('LeadUpdatesService', () => {
  let service: LeadUpdatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadUpdatesService],
    }).compile();

    service = module.get<LeadUpdatesService>(LeadUpdatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
