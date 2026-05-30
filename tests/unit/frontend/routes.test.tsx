import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PrivacyPolicy from '../../../src/pages/PrivacyPolicy'
import TermsOfService from '../../../src/pages/TermsOfService'

// Mock AuthContext to bypass provider requirement
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signOut: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Legal page routes', () => {
  it('navigates to /privacy and renders PrivacyPolicy component', () => {
    render(
      <MemoryRouter initialEntries={['/privacy']}>
        <Routes>
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeTruthy()
  })

  it('navigates to /terms and renders TermsOfService component', () => {
    render(
      <MemoryRouter initialEntries={['/terms']}>
        <Routes>
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /terms of service/i })).toBeTruthy()
  })
})
