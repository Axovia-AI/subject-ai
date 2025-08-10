/**
 * @file DigikeyService.ts
 * @brief Service for interacting with Digikey-related Supabase Edge Functions
 */

import { supabase } from '@/integrations/supabase/client'

export type PurchaseOrderItem = { partNumber: string; quantity: number }

/**
 * @class DigikeyService
 * @brief Singleton service wrapping supabase.functions.invoke
 */
export class DigikeyService {
  private static instance: DigikeyService

  static getInstance(): DigikeyService {
    if (!this.instance) this.instance = new DigikeyService()
    return this.instance
  }

  /**
   * Search parts via edge function
   */
  async searchParts(query: string, limit: number = 20): Promise<any> {
    const { data, error } = await supabase.functions.invoke('digikey-api', {
      body: { action: 'searchParts', query, limit },
    })

    if (error) return { success: false, error }
    return data
  }

  /**
   * Validate connection to Digikey API
   */
  async validateConnection(): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke('digikey-api', {
      body: { action: 'testConnection' },
    })

    if (error) return false
    return Boolean(data?.success)
  }

  /**
   * Create a mock purchase order locally for demo/testing purposes.
   * In real app, we'd call an edge function or backend endpoint.
   */
  async createPurchaseOrder(items: PurchaseOrderItem[]) {
    // Simulate success response
    return {
      success: true,
      data: {
        orderId: `DK-${Date.now()}`,
        items,
      },
    }
  }
}

