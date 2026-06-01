// Serviço de produtos - Supabase优先, fallback para mock
export {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getRelatedProducts,
  getMockProducts,
  clearProductCache,
} from './productService'

// Mock legado (manter para compatibilidade)
export { products } from './products'
export type { Product } from './products'
