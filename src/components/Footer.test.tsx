import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'

describe('Footer', () => {
  it('renders Privacy Policy link pointing to /privacy', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink).toHaveAttribute('href', '/privacy')
  })

  it('renders Terms of Service link pointing to /terms', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const termsLink = screen.getByRole('link', { name: /terms of service/i })
    expect(termsLink).toBeInTheDocument()
    expect(termsLink).toHaveAttribute('href', '/terms')
  })

  it('renders Cookie Policy link pointing to /privacy#cookies', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const cookieLink = screen.getByRole('link', { name: /cookie policy/i })
    expect(cookieLink).toBeInTheDocument()
    expect(cookieLink).toHaveAttribute('href', '/privacy#cookies')
  })
})
