import { useState, useEffect, useCallback } from 'react'
import { supabase, mapSupabaseToProduct, type SupabaseProduct } from '@/lib/supabase'
import type { Product } from '@/data/products'

interface UseSupabaseProductsReturn {
  products: Product[]
  isLoading: boolean
  error: string | null
  isUsingSupabase: boolean
  refetch: () => void
}

// Produtos mock como fallback
let mockProductsCache: Product[] | null = null

async function loadMockProducts(): Promise<Product[]> {
  if (mockProductsCache) return mockProductsCache
  const { products } = await import('@/data/products')
  mockProductsCache = products
  return products
}

export function useSupabaseProducts(): UseSupabaseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingSupabase, setIsUsingSupabase] = useState(false)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Tentar buscar do Supabase primeiro
      const { data, error: supaError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (supaError) {
        console.warn('[Supabase] Erro ao buscar produtos:', supaError.message)
        throw new Error(supaError.message)
      }

      if (data && data.length > 0) {
        // Converter e usar produtos do Supabase
        const mapped = (data as SupabaseProduct[]).map(mapSupabaseToProduct)
        console.log(`[Supabase] ${mapped.length} produtos carregados do banco`)
        setProducts(mapped)
        setIsUsingSupabase(true)
        setIsLoading(false)
        return
      }

      // Se tabela vazia, usar mock como fallback
      console.log('[Supabase] Tabela vazia, usando mock como fallback')
      throw new Error('Nenhum produto no banco')

    } catch (err: any) {
      // Fallback para mock
      console.log('[Products] Fallback para dados locais')
      try {
        const mock = await loadMockProducts()
        setProducts(mock)
        setIsUsingSupabase(false)
      } catch (mockErr) {
        setError('Não foi possível carregar os produtos')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    isLoading,
    error,
    isUsingSupabase,
    refetch: fetchProducts,
  }
}

// Buscar produtos por categoria
export function useSupabaseProductsByCategory(categorySlug: string): UseSupabaseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingSupabase, setIsUsingSupabase] = useState(false)

  const fetchByCategory = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supaError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`category.ilike.${categorySlug},subcategory.ilike.${categorySlug}`)
        .order('created_at', { ascending: false })

      if (supaError) throw new Error(supaError.message)

      if (data && data.length > 0) {
        const mapped = (data as SupabaseProduct[]).map(mapSupabaseToProduct)
        setProducts(mapped)
        setIsUsingSupabase(true)
      } else {
        // Fallback: buscar nos mocks por categoria
        const { getProductsByCategory } = await import('@/data/products')
        const mock = getProductsByCategory(categorySlug)
        setProducts(mock)
        setIsUsingSupabase(false)
      }
    } catch (err: any) {
      try {
        const { getProductsByCategory } = await import('@/data/products')
        const mock = getProductsByCategory(categorySlug)
        setProducts(mock)
        setIsUsingSupabase(false)
      } catch {
        setError('Erro ao carregar produtos da categoria')
      }
    } finally {
      setIsLoading(false)
    }
  }, [categorySlug])

  useEffect(() => {
    fetchByCategory()
  }, [fetchByCategory])

  return {
    products,
    isLoading,
    error,
    isUsingSupabase,
    refetch: fetchByCategory,
  }
}

// Buscar um produto por ID
export function useSupabaseProductById(id: string | undefined): {
  product: Product | null
  isLoading: boolean
  error: string | null
  isUsingSupabase: boolean
} {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingSupabase, setIsUsingSupabase] = useState(false)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function fetchProduct() {
      setIsLoading(true)
      setError(null)

      try {
        // Tentar por legacy_id primeiro, depois por uuid
        const { data, error: supaError } = await supabase
          .from('products')
          .select('*')
          .eq('legacy_id', id)
          .eq('is_active', true)
          .single()

        if (!supaError && data) {
          if (!cancelled) {
            setProduct(mapSupabaseToProduct(data as SupabaseProduct))
            setIsUsingSupabase(true)
          }
          return
        }

        // Tentar por UUID
        const { data: data2, error: err2 } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()

        if (!err2 && data2) {
          if (!cancelled) {
            setProduct(mapSupabaseToProduct(data2 as SupabaseProduct))
            setIsUsingSupabase(true)
          }
          return
        }

        throw new Error('Produto não encontrado no banco')
      } catch (err: any) {
        // Fallback para mock
        try {
          const { getProductById } = await import('@/data/products')
          const mock = getProductById(id)
          if (!cancelled) {
            setProduct(mock || null)
            setIsUsingSupabase(false)
          }
        } catch {
          if (!cancelled) setError('Produto não encontrado')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchProduct()
    return () => { cancelled = true }
  }, [id])

  return { product, isLoading, error, isUsingSupabase }
}
