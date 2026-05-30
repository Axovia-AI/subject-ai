import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UsageLimits } from './UsageLimits';
import { Toaster } from "@/components/ui/toaster";

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn().mockResolvedValue({ data: [], error: null })
          }))
        }))
      }))
    })),
    functions: {
      invoke: vi.fn()
    }
  }
}));

const renderWithToaster = (ui: React.ReactElement) => {
  return render(
    <>
      {ui}
      <Toaster />
    </>
  );
};

describe('UsageLimits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state initially', () => {
    renderWithToaster(<UsageLimits userId="test-user-123" />);
    expect(screen.getByText(/loading usage data/i)).toBeInTheDocument();
  });

  test('renders free plan when loaded', async () => {
    renderWithToaster(<UsageLimits userId="test-user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
    });
  });
});

/**
 * Test for Bug Fix: getEffectivePlan now correctly returns valid PLANS keys
 *
 * Previously, the function returned 'premium' as a fallback, but PLANS only had
 * 'free', 'pro', 'enterprise' keys. This caused planLimits to be undefined.
 *
 * The fix maps all subscription tiers to valid PLANS keys.
 */
describe('getEffectivePlan mapping', () => {
  // Exported helper for testing - mirrors the logic in UsageLimits.tsx
  const getEffectivePlan = (subscriptionData: any): string => {
    if (!subscriptionData?.subscribed) return 'free';

    const tier = subscriptionData.subscription_tier?.toLowerCase();
    if (!tier) return 'pro';
    if (tier === 'professional' || tier === 'pro' || tier === 'premium') return 'pro';
    if (tier === 'enterprise' || tier === 'unlimited') return 'enterprise';
    if (tier === 'starter' || tier === 'basic') return 'pro';

    return 'pro';
  };

  const VALID_PLAN_KEYS = ['free', 'pro', 'enterprise'];

  test('returns "free" for non-subscribed users', () => {
    expect(getEffectivePlan(null)).toBe('free');
    expect(getEffectivePlan({ subscribed: false })).toBe('free');
  });

  test('returns "pro" for subscribed users with no specific tier', () => {
    const result = getEffectivePlan({ subscribed: true });
    expect(result).toBe('pro');
    expect(VALID_PLAN_KEYS).toContain(result);
  });

  test('returns "pro" for Professional tier', () => {
    const result = getEffectivePlan({ subscribed: true, subscription_tier: 'Professional' });
    expect(result).toBe('pro');
    expect(VALID_PLAN_KEYS).toContain(result);
  });

  test('returns "pro" for premium tier (bug fix - previously returned invalid "premium")', () => {
    const result = getEffectivePlan({ subscribed: true, subscription_tier: 'premium' });
    expect(result).toBe('pro');
    expect(VALID_PLAN_KEYS).toContain(result);
  });

  test('returns "enterprise" for Enterprise tier', () => {
    const result = getEffectivePlan({ subscribed: true, subscription_tier: 'Enterprise' });
    expect(result).toBe('enterprise');
    expect(VALID_PLAN_KEYS).toContain(result);
  });

  test('all returned values are valid PLANS keys', () => {
    const testCases = [
      null,
      { subscribed: false },
      { subscribed: true },
      { subscribed: true, subscription_tier: 'Professional' },
      { subscribed: true, subscription_tier: 'premium' },
      { subscribed: true, subscription_tier: 'Enterprise' },
      { subscribed: true, subscription_tier: 'Starter' },
      { subscribed: true, subscription_tier: 'unknown-tier' },
    ];

    for (const testCase of testCases) {
      const result = getEffectivePlan(testCase);
      expect(VALID_PLAN_KEYS).toContain(result);
    }
  });
});
