import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DigikeyService } from '../DigikeyService'

// Mock the supabase functions
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}))

describe('DigikeyService', () => {
  let digikeyService: DigikeyService

  beforeEach(() => {
    vi.clearAllMocks()
    digikeyService = DigikeyService.getInstance()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = DigikeyService.getInstance()
      const instance2 = DigikeyService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('searchParts', () => {
    it('should search parts successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          Products: [
            {
              DigiKeyPartNumber: 'TEST-001-ND',
              ManufacturerPartNumber: 'TEST-001',
              ProductDescription: 'Test Product'
            }
          ]
        }
      }

      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null
      })

      const result = await digikeyService.searchParts('test', 10)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(supabase.functions.invoke).toHaveBeenCalledWith('digikey-api', {
        body: {
          action: 'searchParts',
          query: 'test',
          limit: 10
        }
      })
    })

    it('should handle search errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: new Error('API Error')
      })

      const result = await digikeyService.searchParts('test')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateConnection', () => {
    it('should validate connection successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null
      })

      const result = await digikeyService.validateConnection()
      
      expect(result).toBe(true)
      expect(supabase.functions.invoke).toHaveBeenCalledWith('digikey-api', {
        body: {
          action: 'testConnection'
        }
      })
    })

    it('should handle connection validation errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: new Error('Connection failed')
      })

      const result = await digikeyService.validateConnection()
      
      expect(result).toBe(false)
    })
  })

  describe('createPurchaseOrder', () => {
    it('should create purchase order successfully', async () => {
      const items = [
        { partNumber: 'TEST-001', quantity: 10 }
      ]

      const result = await digikeyService.createPurchaseOrder(items)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.orderId).toMatch(/^DK-\d+$/)
      expect(result.data.items).toEqual(items)
    })
  })
})
