import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailOptimizer } from './EmailOptimizer';

// Mock the contexts and dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
        })),
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({
        data: { session: { access_token: 'mock-token' } }
      })),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Import after mocking
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const mockAuth = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  loading: false,
  signOut: vi.fn(),
};

const mockToast = vi.fn();

describe('EmailOptimizer with Scoring', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue(mockAuth);
    vi.mocked(useToast).mockReturnValue({ toast: mockToast });
    vi.clearAllMocks();
  });

  it('renders both optimize and score tabs', () => {
    render(<EmailOptimizer />);
    
    expect(screen.getByText('Optimize')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
  });

  it('switches between optimize and score modes', () => {
    render(<EmailOptimizer />);
    
    // Should start in optimize mode
    expect(screen.getByText('Optimize Subject Line')).toBeInTheDocument();
    
    // Click score tab
    fireEvent.click(screen.getByText('Score'));
    
    // Should now show score button
    expect(screen.getByText('Score Subject Line')).toBeInTheDocument();
  });

  it('calls score-subject function when scoring', async () => {
    const mockScoreResponse = {
      success: true,
      result: {
        score: 85,
        rationale: 'Good subject line with clear value proposition',
        breakdown: {
          length: { score: 20, max: 20, feedback: 'Perfect length' },
          engagement: { score: 22, max: 25, feedback: 'High engagement' },
          clarity: { score: 18, max: 20, feedback: 'Very clear' },
          spam: { score: 20, max: 20, feedback: 'No spam indicators' },
          polish: { score: 15, max: 15, feedback: 'Professional' },
        },
        suggestions: ['Great job! Consider A/B testing variations.'],
      },
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockScoreResponse,
      error: null,
    });

    render(<EmailOptimizer />);
    
    // Switch to score mode
    fireEvent.click(screen.getByText('Score'));
    
    // Enter a subject line
    const input = screen.getByPlaceholderText(/meeting request/i);
    fireEvent.change(input, { target: { value: 'Q3 Sales Report: Key Results' } });
    
    // Click score button
    const scoreButton = screen.getByText('Score Subject Line');
    fireEvent.click(scoreButton);
    
    // Wait for the scoring to complete
    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('score-subject', {
        body: {
          subject: 'Q3 Sales Report: Key Results',
          context: undefined,
          tone: 'professional',
        },
        headers: {
          Authorization: 'Bearer mock-token',
        },
      });
    });
  });

  it('displays score results correctly', async () => {
    const mockScoreResponse = {
      success: true,
      result: {
        score: 85,
        rationale: 'Good subject line with clear value proposition',
        breakdown: {
          length: { score: 20, max: 20, feedback: 'Perfect length' },
          engagement: { score: 22, max: 25, feedback: 'High engagement' },
          clarity: { score: 18, max: 20, feedback: 'Very clear' },
          spam: { score: 20, max: 20, feedback: 'No spam indicators' },
          polish: { score: 15, max: 15, feedback: 'Professional' },
        },
        suggestions: ['Great job! Consider A/B testing variations.'],
      },
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockScoreResponse,
      error: null,
    });

    render(<EmailOptimizer />);
    
    // Switch to score mode and enter subject
    fireEvent.click(screen.getByText('Score'));
    const input = screen.getByPlaceholderText(/meeting request/i);
    fireEvent.change(input, { target: { value: 'Q3 Sales Report: Key Results' } });
    
    // Click score button
    fireEvent.click(screen.getByText('Score Subject Line'));
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Subject Line Score Analysis')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument(); // Score
      expect(screen.getByText('Very Good')).toBeInTheDocument(); // Score level
      expect(screen.getByText(/Good subject line with clear value proposition/)).toBeInTheDocument();
    });
  });

  it('handles scoring errors gracefully', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: new Error('Failed to score'),
    });

    render(<EmailOptimizer />);
    
    // Switch to score mode and enter subject
    fireEvent.click(screen.getByText('Score'));
    const input = screen.getByPlaceholderText(/meeting request/i);
    fireEvent.change(input, { target: { value: 'Test Subject' } });
    
    // Click score button
    fireEvent.click(screen.getByText('Score Subject Line'));
    
    // Wait for error to appear
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Scoring failed',
        description: 'Please check your input and try again.',
        variant: 'destructive',
      });
    });
  });

  it('requires authentication for scoring', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuth,
      user: null,
    });

    render(<EmailOptimizer />);
    
    // Switch to score mode and enter subject
    fireEvent.click(screen.getByText('Score'));
    const input = screen.getByPlaceholderText(/meeting request/i);
    fireEvent.change(input, { target: { value: 'Test Subject' } });
    
    // Click score button
    fireEvent.click(screen.getByText('Score Subject Line'));
    
    // Should show authentication error
    expect(screen.getByText('Please sign in to use the scoring feature')).toBeInTheDocument();
  });

  it('clears both optimization and scoring results when clear is clicked', async () => {
    render(<EmailOptimizer />);
    
    // Add some content
    const input = screen.getByPlaceholderText(/meeting request/i);
    fireEvent.change(input, { target: { value: 'Test Subject' } });
    
    // Click clear
    fireEvent.click(screen.getByText('Clear'));
    
    // Input should be cleared
    expect(input).toHaveValue('');
  });
});