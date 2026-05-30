import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileSettings } from './ProfileSettings';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('ProfileSettings', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial profile data', () => {
    const profile = {
      full_name: 'John Doe',
      email: 'john@example.com',
      created_at: '2024-01-01T00:00:00Z',
    };

    render(
      <ProfileSettings
        profile={profile}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    // Check that form fields show profile data
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('syncs form data when profile prop changes after mount', async () => {
    // BUG TEST: Start with null profile (loading state)
    const { rerender } = render(
      <ProfileSettings
        profile={null}
        onUpdate={mockOnUpdate}
        isLoading={true}
      />
    );

    // Initially, form should be empty or have default values
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    expect(nameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');

    // Now simulate profile loading complete with new data
    const loadedProfile = {
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      created_at: '2024-02-01T00:00:00Z',
    };

    rerender(
      <ProfileSettings
        profile={loadedProfile}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    // BUG: The form should update to show the loaded profile data
    // This test will FAIL (RED) if the component doesn't sync form state
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue('Jane Smith');
    });
    expect(screen.getByLabelText(/email address/i)).toHaveValue('jane@example.com');
  });

  it('displays member since date correctly', () => {
    const profile = {
      full_name: 'Test User',
      email: 'test@example.com',
      created_at: '2024-06-15T10:30:00Z',
    };

    render(
      <ProfileSettings
        profile={profile}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    // Should display formatted date
    expect(screen.getByText(/june 15, 2024/i)).toBeInTheDocument();
  });

  it('generates correct initials for avatar', () => {
    const profile = {
      full_name: 'Alice Bob',
      email: 'alice@example.com',
      created_at: '2024-01-01T00:00:00Z',
    };

    render(
      <ProfileSettings
        profile={profile}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    // Should display initials "AB"
    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});
