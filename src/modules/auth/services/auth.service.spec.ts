import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    password_hash: 'hashedPassword',
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      });

      expect(result).toBeDefined();
      expect(result.email).toEqual('test@example.com');
      expect(mockUsersService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const result = await service.login(mockUser);
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toEqual('test-token');
    });
  });
});
