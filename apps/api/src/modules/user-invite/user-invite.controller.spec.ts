import { Test, TestingModule } from '@nestjs/testing';
import { UserInviteController } from './user-invite.controller';

describe('UserInviteController', () => {
  let controller: UserInviteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserInviteController],
    }).compile();

    controller = module.get<UserInviteController>(UserInviteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
