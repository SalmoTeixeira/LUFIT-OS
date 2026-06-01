import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dgzgqblkcewqqfmqqzbs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnemdxYmxrY2V3cXFmbXFxemJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDY3MjMsImV4cCI6MjA5NDYyMjcyM30.aLbqJk7dG_lLJPFo5U5eEb9dKYkUHXCxFLBTbKnFDNo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  db: {
    schema: 'public',
  },
})

// Tipagem para produtos do Supabase
export interface SupabaseProduct {
  id: string
  legacy_id: string | null
  name: string
  sku: string | null
  description: string | null
  specifications: any[]
  price: number
  old_price: number | null
  cost_price: number | null
  category: string | null
  subcategory: string | null
  image: string | null
  images: string[]
  sizes: string[]
  colors: { name: string; hex: string }[]
  rating: number
  review_count: number
  is_new: boolean
  is_sale: boolean
  is_active: boolean
  created_at: string
}

// Converter produto do Supabase para formato usado no frontend
export function mapSupabaseToProduct(row: SupabaseProduct): import('@/data/products').Product {
  return {
    id: row.legacy_id || row.id,
    name: row.name,
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    image: row.image || '/produtos/placeholder.jpg',
    images: Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : [row.image || '/produtos/placeholder.jpg'],
    category: row.category || 'geral',
    subcategory: row.subcategory || '',
    sizes: Array.isArray(row.sizes) ? row.sizes : ['P', 'M', 'G', 'GG'],
    colors: Array.isArray(row.colors) && row.colors.length > 0
      ? row.colors
      : [{ name: 'Preto', hex: '#000000' }],
    description: row.description || '',
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    rating: Number(row.rating) || 5,
    reviewCount: Number(row.review_count) || 0,
    isNew: row.is_new || false,
    isSale: row.is_sale || false,
    sku: row.sku || row.id,
  }
}
