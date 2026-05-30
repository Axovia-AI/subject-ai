import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Auth from './Auth'
import { supabase } from '@/integrations/supabase/client'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false })
}))

describe('Auth page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockNavigate.mockClear()
  })

  // BUG: Error state persists when switching between login and signup tabs
  it('clears error state when switching between tabs', async () => {
    // Mock login failure
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials', name: 'AuthApiError', status: 400 }
    } as any)

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    )

    const user = userEvent.setup()

    // Fill in login form with invalid credentials and submit
    const email = await screen.findByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    await user.type(email, 'invalid@example.com')
    await user.type(password, 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    // Wait for error to appear
    await screen.findByText('Invalid credentials')

    // Switch to signup tab
    await user.click(screen.getByRole('tab', { name: /sign up/i }))

    // Error should be cleared when switching tabs
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
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

  // BUG: Button should stay in loading state during successful login until navigation completes
  // Currently, setIsLoading(false) is called even on success, causing the button to briefly
  // appear enabled before navigation occurs
  it('keeps button disabled after successful login until navigation', async () => {
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' }, session: {} },
      error: null
    } as any)

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    )

    const user = userEvent.setup()

    // Fill in login form
    const email = await screen.findByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    await user.type(email, 'test@example.com')
    await user.type(password, 'password123')

    const signInButton = screen.getByRole('button', { name: /sign in$/i })

    // Submit the form
    await user.click(signInButton)

    // After successful login, the button should remain disabled (loading state)
    // until the component navigates away. This prevents any flash of enabled state.
    // The bug is that setIsLoading(false) is called unconditionally after login.
    await waitFor(() => {
      // The button should still be disabled after successful login
      // because we're waiting for navigation to complete
      expect(signInButton).toBeDisabled()
    }, { timeout: 100 })
  })
})
