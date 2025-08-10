import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'
import { supabase } from '@/integrations/supabase/client'

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  return {
    ...actual as any,
    useNavigate: () => vi.fn(),
  }
})

// Provide minimal user shape used by Header (only `id` is indirectly used)
const mockUser = { id: 'user_123' } as any

describe('Header', () => {
  const onAuthChangeUnsubscribe = { unsubscribe: vi.fn() }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders unauthenticated actions when no user session', async () => {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({ data: { session: null } } as any)
    vi.spyOn(supabase.auth, 'onAuthStateChange').mockReturnValue({ data: { subscription: onAuthChangeUnsubscribe } } as any)

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    // Buttons for unauthenticated state
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start free trial/i })).toBeInTheDocument()

    // Authenticated-only buttons should not be present
    expect(screen.queryByRole('button', { name: /dashboard/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /sign out/i })).toBeNull()
  })

  it('renders authenticated actions when user session exists', async () => {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({ data: { session: { user: mockUser } } } as any)
    vi.spyOn(supabase.auth, 'onAuthStateChange').mockReturnValue({ data: { subscription: onAuthChangeUnsubscribe } } as any)

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    // Buttons for authenticated state
    expect(await screen.findByRole('button', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()

    // Unauthenticated-only buttons should not be present
    expect(screen.queryByRole('button', { name: /sign in/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /start free trial/i })).toBeNull()
  })
})
