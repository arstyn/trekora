import { Test, TestingModule } from '@nestjs/testing';
import { UserDepartmentsService } from './user-departments.service';

describe('UserDepartmentsService', () => {
  let service: UserDepartmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDepartmentsService],
    }).compile();

    service = module.get<UserDepartmentsService>(UserDepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
