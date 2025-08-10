import { describe, it, expect, vi } from 'vitest'

describe('Service Integration Tests', () => {
  describe('Service imports', () => {
    it('should import ComponentService without errors', async () => {
      vi.mock('@/integrations/supabase/client', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }
      }))

      const { ComponentService } = await import('../../services/ComponentService')
      expect(ComponentService).toBeDefined()
      expect(typeof ComponentService.getAllComponents).toBe('function')
    })

    it('should import DigikeyService without errors', async () => {
      vi.mock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: {
            invoke: vi.fn()
          }
        }
      }))

      const { DigikeyService } = await import('../../services/DigikeyService')
      const instance = DigikeyService.getInstance()
      expect(instance).toBeDefined()
      expect(typeof instance.searchParts).toBe('function')
    })

    it('should import PurchaseOrderService without errors', async () => {
      vi.mock('@/integrations/supabase/client', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }
      }))

      const { purchaseOrderService } = await import('../../services/PurchaseOrderService')
      expect(purchaseOrderService).toBeDefined()
      expect(typeof purchaseOrderService.getAllPurchaseOrders).toBe('function')
    })
  })
})
