import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PublicController } from './public.controller';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { BalanceService } from '../reports/balance.service';

describe('PublicController', () => {
  let controller: PublicController;
  const mockFindByShareToken = jest.fn();
  const mockCalculateSubscriptionBalance = jest.fn();

  const mockSubscription = {
    id: 'sub-1',
    title: 'Test Sub',
    billing_day: 15,
    is_active: true,
  };

  const mockBalance = {
    subscription_id: 'sub-1',
    subscription_title: 'Test Sub',
    total_amount: 100,
    user_balances: [
      {
        user_name: 'Alice',
        total_charges: 50,
        total_verified_payments: 30,
        total_pending_payments: 10,
        balance_due: 20,
      },
    ],
    total_charges: 50,
    total_verified_payments: 30,
    total_pending_payments: 10,
    overall_balance_due: 20,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: {
            findByShareToken: mockFindByShareToken,
          },
        },
        {
          provide: BalanceService,
          useValue: {
            calculateSubscriptionBalance: mockCalculateSubscriptionBalance,
          },
        },
      ],
    }).compile();

    controller = module.get<PublicController>(PublicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return 404 for invalid share token', async () => {
    mockFindByShareToken.mockResolvedValue(null);
    const req = { ip: '127.0.0.1', get: () => '', socket: { remoteAddress: '127.0.0.1' } } as any;

    await expect(
      controller.getSubscriptionBalance('invalid-token', req),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return balance for valid share token', async () => {
    mockFindByShareToken.mockResolvedValue(mockSubscription);
    mockCalculateSubscriptionBalance.mockResolvedValue(mockBalance);

    const req = { ip: '127.0.0.1', get: () => '', socket: { remoteAddress: '127.0.0.1' } } as any;

    const result = await controller.getSubscriptionBalance('valid-uuid-token', req);

    expect(result.subscription_title).toBe('Test Sub');
    expect(result.total_amount).toBe(100);
    expect(result.billing_day).toBe(15);
    expect(result.user_balances).toHaveLength(1);
    expect(result.user_balances[0].user_name).toBe('Alice');
    expect(result.user_balances[0]).not.toHaveProperty('user_email');
    expect(result.user_balances[0]).not.toHaveProperty('user_id');
  });
});
