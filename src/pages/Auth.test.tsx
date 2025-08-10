import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Auth from './Auth'
import { supabase } from '@/integrations/supabase/client'

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  return {
    ...actual as any,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false })
}))

describe('Auth page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('allows login form input and calls supabase signInWithPassword on submit', async () => {
    const signInMock = vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({ data: {}, error: null } as any)

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    )

    // login tab is default
    const user = userEvent.setup()
    const email = await screen.findByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)

    await user.type(email, 'user@example.com')
    await user.type(password, 'secret123')

    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    expect(signInMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123'
    })
  })

  it('switches to signup tab and calls supabase signUp on submit', async () => {
    const signUpMock = vi.spyOn(supabase.auth, 'signUp').mockResolvedValue({ data: {}, error: null } as any)

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    )

    // switch to signup tab
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: /sign up/i }))

    const fullName = await screen.findByLabelText(/full name/i)
    const email = screen.getByLabelText(/^email$/i)
    const password = screen.getByLabelText(/^password$/i)

    await user.type(fullName, 'Test User')
    await user.type(email, 'new@example.com')
    await user.type(password, 'secret123')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(signUpMock).toHaveBeenCalled()
    const args = (signUpMock as unknown as any).mock.calls[0][0]
    expect(args.email).toBe('new@example.com')
    expect(args.password).toBe('secret123')
    // options should include redirect and full_name when provided
    expect(args.options).toBeTruthy()
  })
})
