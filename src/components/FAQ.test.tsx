import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FAQ from './FAQ'

describe('FAQ', () => {
  const expectedQuestions = [
    'How does Subject AI improve my email open rates?',
    'What AI technology powers Subject AI?',
    'Is my email content secure and private?',
    'Can I cancel my subscription anytime?',
    'Do you offer a free trial?',
    'What email platforms do you integrate with?',
    'How many subject lines can I optimize per month?',
  ]

  it('renders all FAQ items', () => {
    render(<FAQ />)

    expectedQuestions.forEach((question) => {
      expect(screen.getByText(question)).toBeInTheDocument()
    })
  })

  it('renders section heading', () => {
    render(<FAQ />)

    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument()
  })

  it('accordion expands on click', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    const firstQuestion = screen.getByText(expectedQuestions[0])
    const trigger = firstQuestion.closest('button')

    // Initially collapsed - content should not be visible
    expect(trigger).toHaveAttribute('data-state', 'closed')

    // Click to expand
    await user.click(trigger!)

    // Should now be expanded
    expect(trigger).toHaveAttribute('data-state', 'open')
  })

  it('accordion collapses when clicking an expanded item', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    const firstQuestion = screen.getByText(expectedQuestions[0])
    const trigger = firstQuestion.closest('button')

    // Click to expand
    await user.click(trigger!)
    expect(trigger).toHaveAttribute('data-state', 'open')

    // Click again to collapse
    await user.click(trigger!)
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    // Tab to first accordion trigger
    await user.tab()

    const firstTrigger = screen.getByText(expectedQuestions[0]).closest('button')
    expect(firstTrigger).toHaveFocus()

    // Press Enter to expand
    await user.keyboard('{Enter}')
    expect(firstTrigger).toHaveAttribute('data-state', 'open')

    // Press Space to collapse
    await user.keyboard(' ')
    expect(firstTrigger).toHaveAttribute('data-state', 'closed')
  })

  it('has accessible ARIA attributes', () => {
    render(<FAQ />)

    const triggers = screen.getAllByRole('button')

    triggers.forEach((trigger) => {
      // Each trigger should have aria-expanded
      expect(trigger).toHaveAttribute('aria-expanded')
      // Each trigger should have aria-controls pointing to the content
      expect(trigger).toHaveAttribute('aria-controls')
    })
  })

  it('allows navigating between items with arrow keys', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    // Focus first trigger
    const firstTrigger = screen.getByText(expectedQuestions[0]).closest('button')
    firstTrigger?.focus()

    // Press down arrow to move to next item
    await user.keyboard('{ArrowDown}')

    const secondTrigger = screen.getByText(expectedQuestions[1]).closest('button')
    expect(secondTrigger).toHaveFocus()
  })
})
