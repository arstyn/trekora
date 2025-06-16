import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ILoginDto } from '@repo/api/auth/dto/auth.types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup with correct parameters', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
      };

      const expectedResponse = { message: 'User created successfully' };
      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.signup(userData);

      expect(mockAuthService.signup).toHaveBeenCalledWith(userData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle signup without phone number', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = { message: 'User created successfully' };
      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.signup(userData);

      expect(mockAuthService.signup).toHaveBeenCalledWith(userData);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct credentials', async () => {
      const credentials: ILoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(credentials);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('logout', () => {
    it('should call authService.logout', () => {
      const expectedResponse = { message: 'Logged out successfully' };
      mockAuthService.logout.mockReturnValue(expectedResponse);

      const result = controller.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('refreshAccessToken', () => {
    it('should call authService.refreshAccessToken with correct refresh token', async () => {
      const refreshToken = 'mock-refresh-token';
      const expectedResponse = {
        accessToken: 'new-access-token',
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(expectedResponse);

      const result = await controller.refreshAccessToken({ refreshToken });

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
