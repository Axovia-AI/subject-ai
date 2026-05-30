import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OnboardingChecklist } from './OnboardingChecklist'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Wrapper component for router context
const renderWithRouter = (
  ui: React.ReactElement,
  { route = '/' } = {}
) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  )
}

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all checklist items', () => {
    renderWithRouter(<OnboardingChecklist />)

    expect(screen.getByText('Complete your profile')).toBeInTheDocument()
    expect(screen.getByText('Optimize your first subject line')).toBeInTheDocument()
    expect(screen.getByText('Choose a subscription plan')).toBeInTheDocument()
    expect(screen.getByText('Explore analytics')).toBeInTheDocument()
    expect(screen.getByText('Connect your email platform')).toBeInTheDocument()
  })

  it('renders the checklist title', () => {
    renderWithRouter(<OnboardingChecklist />)

    expect(screen.getByText('Getting Started')).toBeInTheDocument()
  })

  it('shows progress text', () => {
    renderWithRouter(<OnboardingChecklist />)

    // Initially 0 of 5 complete
    expect(screen.getByText(/0 of 5 complete/i)).toBeInTheDocument()
  })

  it('shows progress bar', () => {
    renderWithRouter(<OnboardingChecklist />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  it('marks items as complete based on completedSteps prop', () => {
    renderWithRouter(
      <OnboardingChecklist
        completedSteps={['profile', 'optimizer']}
      />
    )

    expect(screen.getByText(/2 of 5 complete/i)).toBeInTheDocument()
  })

  it('can be dismissed', async () => {
    renderWithRouter(<OnboardingChecklist />)

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    expect(dismissButton).toBeInTheDocument()

    fireEvent.click(dismissButton)

    // After dismiss, component should not be visible
    await waitFor(() => {
      expect(screen.queryByText('Getting Started')).not.toBeInTheDocument()
    })
  })

  it('saves dismissed state to localStorage', async () => {
    renderWithRouter(<OnboardingChecklist />)

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(dismissButton)

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'onboarding_dismissed',
        'true'
      )
    })
  })

  it('does not render if already dismissed (from localStorage)', () => {
    localStorageMock.getItem.mockReturnValue('true')

    renderWithRouter(<OnboardingChecklist />)

    expect(screen.queryByText('Getting Started')).not.toBeInTheDocument()
  })

  it('links to relevant actions', () => {
    renderWithRouter(<OnboardingChecklist />)

    // Check that action links/buttons exist
    const profileLink = screen.getByRole('button', { name: /complete your profile/i })
    const optimizerLink = screen.getByRole('button', { name: /optimize your first subject line/i })
    const pricingLink = screen.getByRole('button', { name: /choose a subscription plan/i })
    const analyticsLink = screen.getByRole('button', { name: /explore analytics/i })

    expect(profileLink).toBeInTheDocument()
    expect(optimizerLink).toBeInTheDocument()
    expect(pricingLink).toBeInTheDocument()
    expect(analyticsLink).toBeInTheDocument()
  })

  it('shows "Coming soon" badge for email platform connection', () => {
    renderWithRouter(<OnboardingChecklist />)

    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })

  it('calls onStepClick callback when a step is clicked', () => {
    const onStepClick = vi.fn()
    renderWithRouter(<OnboardingChecklist onStepClick={onStepClick} />)

    const profileLink = screen.getByRole('button', { name: /complete your profile/i })
    fireEvent.click(profileLink)

    expect(onStepClick).toHaveBeenCalledWith('profile', 'settings')
  })

  it('renders checkmark icon for completed items', () => {
    renderWithRouter(
      <OnboardingChecklist completedSteps={['profile']} />
    )

    // Find the completed item and verify it has the check indicator
    const profileItem = screen.getByText('Complete your profile').closest('[data-testid]')
    expect(profileItem).toHaveAttribute('data-completed', 'true')
  })

  it('shows all steps complete message when finished', () => {
    renderWithRouter(
      <OnboardingChecklist
        completedSteps={['profile', 'optimizer', 'subscription', 'analytics', 'email-platform']}
      />
    )

    expect(screen.getByText(/5 of 5 complete/i)).toBeInTheDocument()
    expect(screen.getByText(/You're all set!/i)).toBeInTheDocument()
  })
})
