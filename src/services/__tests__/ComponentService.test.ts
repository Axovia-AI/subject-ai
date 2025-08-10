import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ComponentService } from '../ComponentService'

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('ComponentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllComponents', () => {
    it('should fetch all components successfully', async () => {
      const mockData = [
        {
          id: '1',
          part_number: 'TEST-001',
          description: 'Test Component',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          last_updated: '2023-01-01'
        }
      ]

      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null
          })
        })
      } as any)

      const result = await ComponentService.getAllComponents()
      
      expect(result).toEqual(mockData)
      expect(supabase.from).toHaveBeenCalledWith('components')
    })

    it('should handle errors when fetching components', async () => {
      const mockError = new Error('Database error')
      
      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      } as any)

      await expect(ComponentService.getAllComponents()).rejects.toThrow('Failed to fetch components')
    })
  })

  describe('createComponent', () => {
    it('should create a component successfully', async () => {
      const componentData = {
        part_number: 'TEST-001',
        description: 'Test Component',
        category: 'Test Category'
      }

      const mockCreatedComponent = {
        id: '1',
        ...componentData,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        last_updated: '2023-01-01'
      }

      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedComponent,
              error: null
            })
          })
        })
      } as any)

      const result = await ComponentService.createComponent(componentData)
      
      expect(result).toEqual(mockCreatedComponent)
      expect(supabase.from).toHaveBeenCalledWith('components')
    })
  })

  describe('searchComponents', () => {
    it('should search components by query', async () => {
      const query = 'test'
      const mockResults = [
        {
          id: '1',
          part_number: 'TEST-001',
          description: 'Test Component',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          last_updated: '2023-01-01'
        }
      ]

      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockResults,
              error: null
            })
          })
        })
      } as any)

      const result = await ComponentService.searchComponents(query)
      
      expect(result).toEqual(mockResults)
      expect(supabase.from).toHaveBeenCalledWith('components')
    })
  })
})
