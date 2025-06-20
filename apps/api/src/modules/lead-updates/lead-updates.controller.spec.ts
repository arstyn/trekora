import { Test, TestingModule } from '@nestjs/testing';
import { LeadUpdatesController } from './lead-updates.controller';

describe('LeadUpdatesController', () => {
  let controller: LeadUpdatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadUpdatesController],
    }).compile();

    controller = module.get<LeadUpdatesController>(LeadUpdatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
