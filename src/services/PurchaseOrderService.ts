/**
 * @file PurchaseOrderService.ts
 * @brief Service for CRUD operations on purchase orders via Supabase
 */

import { supabase } from '@/integrations/supabase/client'

/**
 * @class PurchaseOrderService
 * @brief Singleton service for interacting with the `purchase_orders` table
 */
export class PurchaseOrderService {
  private static instance: PurchaseOrderService

  static getInstance(): PurchaseOrderService {
    if (!this.instance) this.instance = new PurchaseOrderService()
    return this.instance
  }

  /**
   * Fetch all purchase orders
   */
  async getAllPurchaseOrders(): Promise<any[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  }

  /**
   * Create a new purchase order
   */
  async createPurchaseOrder(order: any): Promise<any> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(order)
      .select('*')
      .single()

    if (error) throw error
    return data
  }
}

export const purchaseOrderService = PurchaseOrderService.getInstance()

