import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InventoryService } from '../InventoryService'

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('InventoryService', () => {
  let inventoryService: InventoryService

  beforeEach(() => {
    vi.clearAllMocks()
    inventoryService = InventoryService.getInstance()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = InventoryService.getInstance()
      const instance2 = InventoryService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('createItem', () => {
    it('should create an inventory item successfully', async () => {
      const itemData = {
        partNumber: 'TEST-001',
        componentName: 'Test Component',
        category: 'Test Category',
        supplier: 'Test Supplier',
        currentStock: 10,
        minStock: 5,
        maxStock: 50,
        unitCost: 10.99,
        autoRestock: false
      }

      const mockCreatedItem = {
        id: '1',
        part_number: itemData.partNumber,
        description: itemData.componentName,
        quantity_available: itemData.currentStock,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        last_updated: '2023-01-01'
      }

      const { supabase } = await import('@/integrations/supabase/client')
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedItem,
              error: null
            })
          })
        })
      } as any)

      const result = await inventoryService.createItem(itemData)
      
      expect(result.partNumber).toBe(itemData.partNumber)
      expect(supabase.from).toHaveBeenCalledWith('components')
    })
  })

  describe('calculateStatus', () => {
    it('should return OUT OF STOCK when current stock is 0', () => {
      // Access the private method through any casting for testing
      const status = (inventoryService as any).calculateStatus(0, 5)
      expect(status).toBe('OUT OF STOCK')
    })

    it('should return LOW STOCK when current stock is below minimum', () => {
      const status = (inventoryService as any).calculateStatus(3, 5)
      expect(status).toBe('LOW STOCK')
    })

    it('should return IN STOCK when current stock is above minimum', () => {
      const status = (inventoryService as any).calculateStatus(10, 5)
      expect(status).toBe('IN STOCK')
    })
  })

  describe('updateItem', () => {
    it('should update an inventory item successfully', async () => {
      // First, we need to add an item to the cache
      const existingItem = {
        id: '1',
        partNumber: 'TEST-001',
        componentName: 'Test Component',
        category: 'Test Category',
        supplier: 'Test Supplier',
        currentStock: 10,
        minStock: 5,
        maxStock: 50,
        unitCost: 10.99,
        inventoryValue: 109.90,
        status: 'IN STOCK' as any,
        autoRestock: false,
        createdAt: new Date() as any,
        lastUpdated: new Date() as any
      }

      // Add item to cache
      ;(inventoryService as any).cache.set('1', existingItem)

      const updateData = {
        id: '1',
        currentStock: 15
      }

      const result = await inventoryService.updateItem(updateData)
      
      expect(result.currentStock).toBe(15)
      expect(result.inventoryValue).toBe(164.85) // 15 * 10.99
    })
  })

  describe('deleteItem', () => {
    it('should delete an inventory item successfully', async () => {
      // Add an item to cache first
      const existingItem = {
        id: '1',
        partNumber: 'TEST-001',
        componentName: 'Test Component',
        category: 'Test Category',
        supplier: 'Test Supplier',
        currentStock: 10,
        minStock: 5,
        maxStock: 50,
        unitCost: 10.99,
        inventoryValue: 109.90,
        status: 'IN STOCK' as any,
        autoRestock: false,
        createdAt: new Date() as any,
        lastUpdated: new Date() as any
      }

      ;(inventoryService as any).cache.set('1', existingItem)

      const result = await inventoryService.deleteItem('1')
      
      expect(result).toBe(true)
      expect((inventoryService as any).cache.has('1')).toBe(false)
    })
  })
})
