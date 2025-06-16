import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: '1',
    email: 'test@example.com',
    phone: '1234567890',
    password: 'hashedPassword',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData: Partial<User> = {
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
      };

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.create(userData);

      expect(mockUserService.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '1';
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const userId = '999';
      mockUserService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(userId);

      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateData: Partial<User> = {
        phone: '9876543210',
      };

      const updatedUser = { ...mockUser, ...updateData };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateData);

      expect(mockUserService.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should return null when user to update is not found', async () => {
      const userId = '999';
      const updateData: Partial<User> = {
        phone: '9876543210',
      };

      mockUserService.update.mockResolvedValue(null);

      const result = await controller.update(userId, updateData);

      expect(mockUserService.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userId = '1';
      mockUserService.remove.mockResolvedValue(undefined);

      await controller.remove(userId);

      expect(mockUserService.remove).toHaveBeenCalledWith(userId);
    });
  });
});
