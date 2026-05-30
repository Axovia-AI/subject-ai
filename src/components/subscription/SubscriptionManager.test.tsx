import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionManager } from './SubscriptionManager';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/toaster';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const renderWithToaster = (ui: React.ReactElement) => {
  return render(
    <>
      {ui}
      <Toaster />
    </>
  );
};

describe('SubscriptionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Bug #1: "Current Plan" badge shows on Free Plan even when user is subscribed
   *
   * The Free Plan card always displays "Current Plan" badge regardless of
   * subscription status. It should only show when user is NOT subscribed.
   */
  test('should NOT show "Current Plan" badge on Free Plan when user is subscribed', async () => {
    // Mock a subscribed user
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        subscribed: true,
        subscription_tier: 'Professional',
        subscription_end: '2025-12-31',
      },
      error: null,
    });

    renderWithToaster(<SubscriptionManager userId="test-user-123" />);

    // Wait for subscription check to complete - use getAllByText since there are multiple "Premium Plan" texts
    await screen.findAllByText('Premium Plan');

    // The "Current Plan" badge should NOT appear on Free Plan when user is subscribed
    // BUG: Currently it always shows "Current Plan" on Free Plan
    const currentPlanBadges = screen.queryAllByText('Current Plan');
    expect(currentPlanBadges.length).toBe(0);
  });

  test('should show "Current Plan" badge on Free Plan when user is NOT subscribed', async () => {
    // Mock a non-subscribed user
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        subscribed: false,
      },
      error: null,
    });

    renderWithToaster(<SubscriptionManager userId="test-user-123" />);

    // Wait for subscription check to complete
    await screen.findByText('Free Plan', { selector: '.text-lg' });

    // The "Current Plan" badge SHOULD appear on Free Plan when user is not subscribed
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
  });

  /**
   * Bug #2: Price inconsistency between SubscriptionManager and Pricing components
   *
   * SubscriptionManager shows "$19.99/mo" for Premium plan, but Pricing.tsx
   * shows Starter at $19, Professional at $49, Enterprise at $149.
   * There is no "Premium" plan at $19.99.
   */
  test('upgrade button price should match actual plan prices', async () => {
    // Mock a non-subscribed user
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        subscribed: false,
      },
      error: null,
    });

    renderWithToaster(<SubscriptionManager userId="test-user-123" />);

    // Wait for component to load
    await screen.findByText('Free Plan', { selector: '.text-lg' });

    // BUG: The upgrade button shows "$19.99/mo" but there's no such price in Pricing.tsx
    // The Starter plan is $19, Professional is $49, Enterprise is $149
    // This test will fail because the current text is "$19.99/mo"
    const upgradeButton = screen.getByRole('button', { name: /upgrade/i });

    // Either the button should show a valid plan price ($19, $49, or $149)
    // or reference the correct plan name from Pricing.tsx
    // Current bug: shows "Upgrade to Premium - $19.99/mo" which doesn't exist
    expect(upgradeButton.textContent).not.toContain('$19.99');
  });

  test('premium plan comparison card should show valid pricing', async () => {
    // Mock a non-subscribed user
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        subscribed: false,
      },
      error: null,
    });

    renderWithToaster(<SubscriptionManager userId="test-user-123" />);

    // Wait for component to load
    await screen.findByText('Free Plan', { selector: '.text-lg' });

    // BUG: Shows "$19.99/month" but this doesn't match any Pricing.tsx plan
    // The badge should show a price that matches one of the actual plans
    const priceBadge = screen.getByText(/\$.*\/month/);
    expect(priceBadge.textContent).not.toBe('$19.99/month');
  });
});

describe('SubscriptionManager - Loading State', () => {
  test('shows loading state initially', () => {
    // Mock a slow response
    vi.mocked(supabase.functions.invoke).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithToaster(<SubscriptionManager userId="test-user-123" />);

    expect(screen.getByText(/checking subscription status/i)).toBeInTheDocument();
  });
});
