import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Testimonials from './Testimonials';

describe('Testimonials', () => {
  it('renders all testimonials', () => {
    render(<Testimonials />);

    // Check that all testimonial names are rendered
    expect(screen.getByText('Rachel M.')).toBeInTheDocument();
    expect(screen.getByText('James T.')).toBeInTheDocument();
    expect(screen.getByText('Priya S.')).toBeInTheDocument();
    expect(screen.getByText('Michael B.')).toBeInTheDocument();
    expect(screen.getByText('Sarah K.')).toBeInTheDocument();
    expect(screen.getByText('David L.')).toBeInTheDocument();
  });

  it('renders section heading', () => {
    render(<Testimonials />);

    expect(screen.getByRole('heading', { name: /what marketers are saying/i })).toBeInTheDocument();
  });

  /**
   * Bug Test: Star ratings should show all 5 stars with filled/empty distinction
   *
   * The original implementation only renders stars equal to the rating count.
   * For example, a 4-star rating shows 4 filled stars but no empty star.
   * This violates the common UX pattern where rating displays show 5 total stars
   * with a visual distinction between filled and unfilled stars.
   *
   * Expected behavior: Always render 5 stars, with filled stars for the rating
   * and empty (outline) stars for the remainder.
   */
  it('renders 5 stars for each testimonial (filled for rating, empty for remainder)', () => {
    render(<Testimonials />);

    // Find a testimonial card with a 4-star rating (e.g., Priya S. or David L.)
    // Priya S. has rating 4, so should show 4 filled + 1 empty = 5 total stars
    const priyaCard = screen.getByText('Priya S.').closest('[class*="CardContent"]');
    expect(priyaCard).toBeTruthy();

    // Count all Star icons in this card - should be 5
    const starContainer = priyaCard!.querySelector('.flex.items-center.gap-1');
    expect(starContainer).toBeTruthy();

    // There should be exactly 5 star elements (svg elements with lucide-star class)
    const allStars = starContainer!.querySelectorAll('svg');
    expect(allStars.length).toBe(5);
  });

  it('renders correct number of filled stars based on rating', () => {
    render(<Testimonials />);

    // Find Rachel M.'s card (5-star rating)
    const rachelCard = screen.getByText('Rachel M.').closest('[class*="CardContent"]');
    expect(rachelCard).toBeTruthy();

    const starContainer = rachelCard!.querySelector('.flex.items-center.gap-1');
    expect(starContainer).toBeTruthy();

    // Count filled stars (they have fill-primary class)
    const filledStars = starContainer!.querySelectorAll('svg.fill-primary');
    expect(filledStars.length).toBe(5);
  });

  it('renders empty stars for unfilled ratings', () => {
    render(<Testimonials />);

    // Find Michael B.'s card (4-star rating)
    const michaelCard = screen.getByText('Michael B.').closest('[class*="CardContent"]');
    expect(michaelCard).toBeTruthy();

    const starContainer = michaelCard!.querySelector('.flex.items-center.gap-1');
    expect(starContainer).toBeTruthy();

    // Should have 4 filled stars
    const filledStars = starContainer!.querySelectorAll('svg.fill-primary');
    expect(filledStars.length).toBe(4);

    // Total should still be 5 stars
    const allStars = starContainer!.querySelectorAll('svg');
    expect(allStars.length).toBe(5);
  });

  it('displays testimonial content', () => {
    render(<Testimonials />);

    // Check some testimonial content is present
    expect(screen.getByText(/We've seen our open rates increase by about 23%/)).toBeInTheDocument();
    expect(screen.getByText(/Saves me roughly 2 hours per week/)).toBeInTheDocument();
  });

  it('displays company and role information', () => {
    render(<Testimonials />);

    expect(screen.getByText(/Email Marketing Manager at E-commerce Brand/)).toBeInTheDocument();
    expect(screen.getByText(/Marketing Lead at B2B SaaS Company/)).toBeInTheDocument();
  });
});
