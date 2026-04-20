import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { UserRepository } from '../../../repository/user.repository';
import { ConfigService } from '@nestjs/config';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: UserRepository, useValue: {} },
        { provide: ConfigService, useValue: { get: () => 10 } },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
