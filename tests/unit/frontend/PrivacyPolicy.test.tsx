import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PrivacyPolicy from '../../../src/pages/PrivacyPolicy'

// Mock AuthContext to bypass provider requirement
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signOut: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('PrivacyPolicy page', () => {
  it('renders the privacy policy heading', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeTruthy()
  })

  it('renders data collection section', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /information we collect/i })).toBeTruthy()
  })

  it('renders data usage section', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    )

    expect(screen.getByText(/how we use your information/i)).toBeTruthy()
  })

  it('renders third party services section with OpenAI, Stripe, and Supabase', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /third-party services/i })).toBeTruthy()
    expect(screen.getAllByText(/openai/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/stripe/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/supabase/i).length).toBeGreaterThan(0)
  })

  it('renders cookies section', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /cookies/i })).toBeTruthy()
  })

  it('renders GDPR rights section', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /your rights/i })).toBeTruthy()
  })

  it('renders contact information', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /contact us/i })).toBeTruthy()
    expect(screen.getByText(/support@axovia.ai/i)).toBeTruthy()
  })

  it('renders Axovia AI company name', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    )

    expect(screen.getAllByText(/axovia ai/i).length).toBeGreaterThan(0)
  })
})
