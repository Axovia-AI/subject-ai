import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Index from './Index'

// Minimal smoke test to ensure the landing page renders without crashing
// Supabase is mocked in src/setupTests.ts

// Mock AuthContext to bypass provider requirement for smoke test
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signOut: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Index page', () => {
  it('renders hero content', () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    // Check for brand text present in Header/Hero (may appear multiple times)
    const matches = screen.getAllByText(/SubjectAI/i)
    expect(matches.length).toBeGreaterThan(0)
  })
})
