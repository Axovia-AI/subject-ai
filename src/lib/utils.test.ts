import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names and ignores falsy values', () => {
    const result = cn('a', undefined, 'b', null as unknown as string, 'd')
    expect(result).toContain('a')
    expect(result).toContain('b')
    expect(result).toContain('d')
    expect(result.includes('c')).toBe(false)
  })

  it('deduplicates conflicting tailwind classes', () => {
    const result = cn('p-2', 'p-4')
    // tailwind-merge should keep the last
    expect(result).toBe('p-4')
  })
})
