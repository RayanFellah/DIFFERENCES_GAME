import { Test, TestingModule } from '@nestjs/testing';
import { GatewayLogicService } from './gateway-logic.service';

describe('GatewayLogicService', () => {
  let service: GatewayLogicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayLogicService],
    }).compile();

    service = module.get<GatewayLogicService>(GatewayLogicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
