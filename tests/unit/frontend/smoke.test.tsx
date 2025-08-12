import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import Header from '../../../src/components/Header'
import { MemoryRouter } from 'react-router-dom'

// Simple smoke test to ensure app renders without crashing

describe('UI smoke', () => {
  it('renders landing content', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )
    // Look for brand text that should exist on the landing page
    const text = screen.getByText(/SubjectAI/i)
    expect(text).toBeTruthy()
  })
})
