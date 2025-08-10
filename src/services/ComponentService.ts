/**
 * @file ComponentService.ts
 * @brief Service for CRUD operations on components via Supabase
 */

import { supabase } from '@/integrations/supabase/client'

/**
 * @class ComponentService
 * @brief Static service for interacting with the `components` table
 */
export class ComponentService {
  /**
   * Fetch all components ordered by last_updated desc
   * @returns Promise<any[]>
   * @throws Error when request fails or data is null
   */
  static async getAllComponents(): Promise<any[]> {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('last_updated', { ascending: false })

    if (error || !data) {
      throw new Error('Failed to fetch components')
    }

    return data
  }

  /**
   * Create a new component and return created row
   * @param component Partial component payload
   * @returns Promise<any>
   */
  static async createComponent(component: any): Promise<any> {
    const { data, error } = await supabase
      .from('components')
      .insert(component)
      .select('*')
      .single()

    if (error) throw error
    return data
  }

  /**
   * Search components by part number or description
   * @param query Search query
   * @returns Promise<any[]>
   */
  static async searchComponents(query: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .or(`part_number.ilike.%${query}%,description.ilike.%${query}%`)
      .order('last_updated', { ascending: false })

    if (error || !data) {
      return []
    }

    return data
  }
}

