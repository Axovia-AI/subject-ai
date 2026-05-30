import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Helper component to access auth context
const TestConsumer = () => {
  const { user, loading, session } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
    </div>
  );
};

// Default mock for onAuthStateChange that always needs to be present
const createMockOnAuthStateChange = (callback?: ((event: string, session: any) => void)) => {
  return vi.fn().mockImplementation((cb: any) => {
    if (callback) {
      // Store callback for later invocation
      setTimeout(() => callback('INITIAL_SESSION', null), 0);
    }
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Default mock for onAuthStateChange
    vi.spyOn(supabase.auth, 'onAuthStateChange').mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('initializes with loading state', () => {
    // Mock getSession to never resolve (simulate slow network)
    vi.spyOn(supabase.auth, 'getSession').mockImplementation(() => new Promise(() => {}));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  // BUG: Race condition - onAuthStateChange fires before getSession completes
  // This test exposes the bug where if onAuthStateChange fires first with a session,
  // but getSession hasn't completed yet, the loading state could be incorrectly managed
  it('handles race condition when onAuthStateChange fires before getSession completes', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    let authChangeCallback: ((event: string, session: any) => void) | null = null;
    let getSessionResolve: ((value: any) => void) | null = null;

    // Mock onAuthStateChange to capture the callback
    vi.spyOn(supabase.auth, 'onAuthStateChange').mockImplementation((callback: any) => {
      authChangeCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // Mock getSession to be controllable (simulating slow network)
    vi.spyOn(supabase.auth, 'getSession').mockImplementation(() => {
      return new Promise((resolve) => {
        getSessionResolve = resolve;
      });
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');

    // Simulate onAuthStateChange firing first (before getSession completes)
    // This can happen when there's a session in storage
    await act(async () => {
      authChangeCallback?.('SIGNED_IN', mockSession);
    });

    // After onAuthStateChange, loading should be false and user should be set
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    // Now getSession completes with the same session
    await act(async () => {
      getSessionResolve?.({ data: { session: mockSession }, error: null });
    });

    // User and session should still be correct (not reset or duplicated)
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  // BUG: getSession error doesn't properly set loading to false in some scenarios
  it('sets loading to false even when getSession fails', async () => {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: { message: 'Network error', name: 'AuthError', status: 500 }
    } as any);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Should eventually stop loading even on error
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // User should be null when there's an error
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });
});
