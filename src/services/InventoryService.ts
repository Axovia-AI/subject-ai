/**
 * @file InventoryService.ts
 * @brief Inventory domain service with simple in-memory cache and helpers
 */

import { supabase } from '@/integrations/supabase/client'

export type InventoryItem = {
  id: string
  partNumber: string
  componentName: string
  category: string
  supplier: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  inventoryValue: number
  status: 'OUT OF STOCK' | 'LOW STOCK' | 'IN STOCK'
  autoRestock: boolean
  createdAt: Date
  lastUpdated: Date
}

/**
 * @class InventoryService
 * @brief Singleton service to manage inventory items
 */
export class InventoryService {
  private static instance: InventoryService
  // Simple cache to support tests of update/delete without backend
  private cache = new Map<string, InventoryItem>()

  static getInstance(): InventoryService {
    if (!this.instance) this.instance = new InventoryService()
    return this.instance
  }

  /** Create and return an item, persisting minimal info to components table */
  async createItem(input: {
    partNumber: string
    componentName: string
    category: string
    supplier: string
    currentStock: number
    minStock: number
    maxStock: number
    unitCost: number
    autoRestock: boolean
  }): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('components')
      .insert({
        part_number: input.partNumber,
        description: input.componentName,
        quantity_available: input.currentStock,
      })
      .select('*')
      .single()

    if (error) throw error

    const item: InventoryItem = {
      id: data.id ?? String(Date.now()),
      partNumber: input.partNumber,
      componentName: input.componentName,
      category: input.category,
      supplier: input.supplier,
      currentStock: input.currentStock,
      minStock: input.minStock,
      maxStock: input.maxStock,
      unitCost: input.unitCost,
      inventoryValue: input.currentStock * input.unitCost,
      status: this.calculateStatus(input.currentStock, input.minStock),
      autoRestock: input.autoRestock,
      createdAt: new Date(),
      lastUpdated: new Date(),
    }

    this.cache.set(item.id, item)
    return item
  }

  /** Update cached item values, recomputing inventory value and status */
  async updateItem(update: { id: string; currentStock?: number }): Promise<InventoryItem> {
    const existing = this.cache.get(update.id)
    if (!existing) throw new Error('Item not found')

    const next: InventoryItem = {
      ...existing,
      currentStock: update.currentStock ?? existing.currentStock,
      inventoryValue: (update.currentStock ?? existing.currentStock) * existing.unitCost,
      status: this.calculateStatus(update.currentStock ?? existing.currentStock, existing.minStock),
      lastUpdated: new Date(),
    }

    this.cache.set(next.id, next)
    return next
  }

  /** Delete cached item */
  async deleteItem(id: string): Promise<boolean> {
    return this.cache.delete(id)
  }

  /**
   * Determine stock status by current vs min
   */
  private calculateStatus(current: number, min: number): InventoryItem['status'] {
    if (current <= 0) return 'OUT OF STOCK'
    if (current < min) return 'LOW STOCK'
    return 'IN STOCK'
  }
}

