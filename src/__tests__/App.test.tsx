import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the landing page content', () => {
    render(<App />)
    // Brand text from Header appears on Index route
    const matches = screen.getAllByText(/SubjectAI/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('mounts with React Query and Theme providers without errors', () => {
    render(<App />)
    // Presence of header nav links indicates the tree rendered fine
    const links = screen.getAllByText(/Features/i)
    expect(links.length).toBeGreaterThan(0)
  })
})
