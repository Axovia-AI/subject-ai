import { describe, it, expect, vi, beforeEach } from 'vitest'
import { purchaseOrderService } from '../PurchaseOrderService'

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('PurchaseOrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllPurchaseOrders', () => {
    it('should fetch all purchase orders successfully', async () => {
      const mockOrders = [
        {
          id: '1',
          order_number: 'PO-001',
          supplier: 'Digi-Key',
          status: 'pending',
          total_amount: 100.00,
          item_count: 5,
          order_date: '2023-01-01',
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ]

      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockOrders,
            error: null
          })
        })
      } as any)

      const result = await purchaseOrderService.getAllPurchaseOrders()
      
      expect(result).toEqual(mockOrders)
      expect(supabase.from).toHaveBeenCalledWith('purchase_orders')
    })

    it('should handle errors when fetching purchase orders', async () => {
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

      await expect(purchaseOrderService.getAllPurchaseOrders()).rejects.toThrow(mockError)
    })
  })

  describe('createPurchaseOrder', () => {
    it('should create a purchase order successfully', async () => {
      const orderData = {
        order_number: 'PO-001',
        supplier: 'Digi-Key',
        total_amount: 100.00,
        item_count: 5,
        order_date: '2023-01-01'
      }

      const mockCreatedOrder = {
        id: '1',
        ...orderData,
        status: 'pending',
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }

      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedOrder,
              error: null
            })
          })
        })
      } as any)

      const result = await purchaseOrderService.createPurchaseOrder(orderData)
      
      expect(result).toEqual(mockCreatedOrder)
      expect(supabase.from).toHaveBeenCalledWith('purchase_orders')
    })
  })
})
