import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt-strategy.service';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/repository/user.repository';

describe('JwtStrategyService', () => {
  let service: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findUserByUsername: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
