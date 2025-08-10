import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Partially mock next-themes to provide stable defaults in tests
vi.mock('next-themes', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    // Provide a no-op ThemeProvider that simply renders children
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ theme: 'light', setTheme: vi.fn() })
  }
})

// Partially mock react-router-dom to keep routing components available
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    // Override only hooks we commonly stub in tests
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' })
  }
})
