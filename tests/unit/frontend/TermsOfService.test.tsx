import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TermsOfService from '../../../src/pages/TermsOfService'

// Mock AuthContext to bypass provider requirement
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signOut: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('TermsOfService page', () => {
  it('renders the terms of service heading', () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /terms of service/i })).toBeTruthy()
  })

  it('renders service description section', () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )

    expect(screen.getByText(/description of service/i)).toBeTruthy()
  })

  it('renders user obligations section', () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )

    expect(screen.getByText(/user obligations/i)).toBeTruthy()
  })

  it('renders payment terms section', () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )

    expect(screen.getByText(/payment terms/i)).toBeTruthy()
  })

  it('renders limitation of liability section', () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )

    expect(screen.getByText(/limitation of liability/i)).toBeTruthy()
  })

  it('renders termination section', () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /termination/i })).toBeTruthy()
  })

  it('renders governing law section', () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )

    expect(screen.getByText(/governing law/i)).toBeTruthy()
  })

  it('renders Axovia AI company name', () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )

    expect(screen.getAllByText(/axovia ai/i).length).toBeGreaterThan(0)
  })

  it('renders contact information', () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )

    expect(screen.getByText(/support@axovia.ai/i)).toBeTruthy()
  })
})
