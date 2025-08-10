import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase client to avoid network/auth side effects in component tests
vi.mock('@/integrations/supabase/client', () => {
  const mockUnsubscribe = vi.fn();
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: mockUnsubscribe } } }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        // Added for Auth page tests
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    },
  };
});
