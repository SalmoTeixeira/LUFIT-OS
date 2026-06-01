/**
 * Product Service - Ligação entre frontend e Supabase
 * Tenta Supabase primeiro, fallback para mock local
 */

import { supabase, mapSupabaseToProduct, type SupabaseProduct } from '@/lib/supabase'
import { products as mockProducts, getProductById as mockGetById, getProductsByCategory as mockGetByCategory, getRelatedProducts as mockGetRelated } from './products'
import type { Product } from './products'

let supabaseCache: Product[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60000 // 60 segundos

// Verificar se cache é válido
function isCacheValid(): boolean {
  return supabaseCache !== null && (Date.now() - cacheTimestamp) < CACHE_TTL
}

// Buscar todos os produtos (Supabase优先)
export async function getAllProducts(): Promise<Product[]> {
  if (isCacheValid() && supabaseCache) {
    console.log('[ProductService] Usando cache do Supabase')
    return supabaseCache
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data && data.length > 0) {
      const mapped = (data as SupabaseProduct[]).map(mapSupabaseToProduct)
      supabaseCache = mapped
      cacheTimestamp = Date.now()
      console.log(`[ProductService] ${mapped.length} produtos do Supabase`)
      return mapped
    }

    throw new Error('Tabela vazia')
  } catch (err: any) {
    console.log('[ProductService] Fallback para mock:', err.message)
    return mockProducts
  }
}

// Buscar produto por ID
export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    // Tentar por legacy_id
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('legacy_id', id)
      .eq('is_active', true)
      .single()

    if (!error && data) return mapSupabaseToProduct(data as SupabaseProduct)

    // Tentar por UUID
    const { data: d2, error: e2 } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (!e2 && d2) return mapSupabaseToProduct(d2 as SupabaseProduct)

    throw new Error('Não encontrado')
  } catch {
    return mockGetById(id)
  }
}

// Buscar produtos por categoria
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`category.ilike.${category},subcategory.ilike.${category}`)

    if (error) throw error

    if (data && data.length > 0) {
      return (data as SupabaseProduct[]).map(mapSupabaseToProduct)
    }

    throw new Error('Nenhum produto na categoria')
  } catch {
    return mockGetByCategory(category)
  }
}

// Produtos relacionados
export function getRelatedProducts(productId: string, limit?: number): Product[] {
  return mockGetRelated(productId, limit)
}

// Fornecer acesso síncrono ao mock (para componentes que não podem esperar)
export function getMockProducts(): Product[] {
  return mockProducts
}

// Limpar cache
export function clearProductCache(): void {
  supabaseCache = null
  cacheTimestamp = 0
}
