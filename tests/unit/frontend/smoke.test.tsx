import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import App from '../../../src/App'

// Simple smoke test to ensure app renders without crashing

describe('App smoke', () => {
  it('renders landing content', () => {
    render(<App />)
    // Look for brand text that should exist on the landing page
    const text = screen.getByText(/SubjectAI/i)
    expect(text).toBeTruthy()
  })
})
