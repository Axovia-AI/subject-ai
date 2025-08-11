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

// jsdom does not implement matchMedia; polyfill for components relying on it (e.g., next-themes, sonner)
// Some environments define the property but not as a function, so check type
// lint-fix: none
if (typeof window.matchMedia !== 'function') {
  // @ts-expect-error augment jsdom window
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated but some libs still call
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Ensure globalThis also has matchMedia (some libs reference it via global scope)
// @ts-expect-error augment jsdom global
if (typeof globalThis.matchMedia !== 'function') {
  // @ts-expect-error augment jsdom global
  globalThis.matchMedia = window.matchMedia
}
