import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pricing from './Pricing';

// Mock the hooks and supabase
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { url: 'https://checkout.stripe.com/test' }, error: null }),
    },
  },
}));

const renderPricing = () => {
  return render(
    <MemoryRouter>
      <Pricing />
    </MemoryRouter>
  );
};

describe('Pricing Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders monthly prices correctly', () => {
    renderPricing();

    // Check monthly prices are displayed
    expect(screen.getByTestId('price-starter')).toHaveTextContent('$19');
    expect(screen.getByTestId('price-professional')).toHaveTextContent('$49');
    expect(screen.getByTestId('price-enterprise')).toHaveTextContent('$149');
  });

  test('renders annual prices with 20% discount', () => {
    renderPricing();

    // Switch to annual billing
    const annualButton = screen.getByTestId('billing-annual');
    fireEvent.click(annualButton);

    // Bug test: Annual prices should be exactly 20% off
    // $19 * 0.8 = $15.20 (rounded to $15)
    // $49 * 0.8 = $39.20 (rounded to $39)
    // $149 * 0.8 = $119.20 (rounded to $119)
    expect(screen.getByTestId('price-starter')).toHaveTextContent('$15');
    expect(screen.getByTestId('price-professional')).toHaveTextContent('$39');
    expect(screen.getByTestId('price-enterprise')).toHaveTextContent('$119');
  });

  /**
   * Bug #1: plans array recreated on every render makes useMemo ineffective
   *
   * This test verifies that when toggling billing periods multiple times,
   * the prices remain stable and consistent (not affected by re-renders).
   */
  test('prices remain stable when toggling billing periods multiple times', () => {
    renderPricing();

    const monthlyButton = screen.getByTestId('billing-monthly');
    const annualButton = screen.getByTestId('billing-annual');

    // Initial monthly prices
    expect(screen.getByTestId('price-professional')).toHaveTextContent('$49');

    // Switch to annual
    fireEvent.click(annualButton);
    expect(screen.getByTestId('price-professional')).toHaveTextContent('$39');

    // Switch back to monthly
    fireEvent.click(monthlyButton);
    expect(screen.getByTestId('price-professional')).toHaveTextContent('$49');

    // Toggle multiple times to ensure stability
    fireEvent.click(annualButton);
    fireEvent.click(monthlyButton);
    fireEvent.click(annualButton);
    expect(screen.getByTestId('price-professional')).toHaveTextContent('$39');
  });

  /**
   * Bug #2: Annual total calculation consistency test
   *
   * When displaying annual pricing, the monthly equivalent should be accurate.
   * For example, if annual is $470.40 total (20% off $588), the monthly equivalent
   * should be $39.20, but rounding to $39 loses $0.20/month = $2.40/year.
   *
   * This test documents the expected behavior - prices should use consistent
   * rounding that doesn't mislead customers about the total annual cost.
   */
  test('annual pricing displays accurate monthly equivalent', () => {
    renderPricing();

    // Switch to annual billing
    const annualButton = screen.getByTestId('billing-annual');
    fireEvent.click(annualButton);

    // Get the displayed price for Professional plan
    const priceElement = screen.getByTestId('price-professional');
    const displayedPrice = parseInt(priceElement.textContent?.replace('$', '') || '0', 10);

    // The annual total should be displayed price * 12
    // If we show $39/month, customers expect to pay $468/year
    // But 20% off $49 * 12 = $470.40
    // This $2.40 discrepancy could be a problem

    // For now, document the current behavior (rounded down)
    expect(displayedPrice).toBe(39); // Math.round(49 * 0.8) = 39
  });
});

describe('Pricing - Billing Period Toggle', () => {
  test('monthly button is active by default', () => {
    renderPricing();

    const monthlyButton = screen.getByTestId('billing-monthly');
    // Check it has the "secondary" variant classes (indicating active state)
    expect(monthlyButton).toHaveClass('bg-background');
  });

  test('annual button shows Save 20% badge', () => {
    renderPricing();

    const annualButton = screen.getByTestId('billing-annual');
    expect(annualButton).toHaveTextContent('Save 20%');
  });
});
