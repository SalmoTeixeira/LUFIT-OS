export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  specifications: string[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isSale?: boolean;
  sku: string;
  barcode?: string;
  ean?: string;
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  count: number;
}

export const categories: Category[] = [
  { name: 'Leggings', slug: 'leggings', image: '/produtos/legging-1.jpg', count: 48 },
  { name: 'Tops & Croppeds', slug: 'tops', image: '/produtos/top-1.jpg', count: 36 },
  { name: 'Macaquinhos', slug: 'macaquinhos', image: '/produtos/macacao-1.jpg', count: 24 },
  { name: 'Macacões', slug: 'macacoes', image: '/produtos/macacao-1.jpg', count: 18 },
  { name: 'Shorts & Bermudas', slug: 'shorts', image: '/produtos/short-1.jpg', count: 32 },
  { name: 'Blusas & Camisetas', slug: 'blusas', image: '/produtos/blusa-1.jpg', count: 28 },
  { name: 'Conjuntos', slug: 'conjuntos', image: '/produtos/conjunto-1.jpg', count: 20 },
  { name: 'Casacos & Jaquetas', slug: 'casacos', image: '/produtos/casaco-1.jpg', count: 15 },
  { name: 'Moda Praia', slug: 'praia', image: '/produtos/top-3.jpg', count: 22 },
  { name: 'Masculino', slug: 'masculino', image: '/produtos/masc-1.jpg', count: 18 },
  { name: 'Linha Infantil', slug: 'infantil', image: '/produtos/inf-1.jpg', count: 12 },
];

export const products: Product[] = [
  // FEMININO - Leggings (8 produtos)
  {
    id: '1', name: 'Calça Legging Energy Poliamida Preta com Elástico Colorido', price: 90.99, oldPrice: 139.99, image: '/produtos/legging-1.jpg', images: ['/produtos/legging-1.jpg', '/produtos/legging-2.jpg', '/produtos/legging-3.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['PP', 'P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Azul Marinho', hex: '#1a1a5e' }], description: 'A Legging Energy é confeccionada em poliamida de alta compressão, proporcionando sustentação e conforto durante os treinos. Modelagem com cós alto que valoriza a silhueta.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Compressive Fit', 'Cós alto duplo', 'Não transparente', 'Secagem rápida'], rating: 4.8, reviewCount: 124, isSale: true, sku: 'LUF-LG-001',
  },
  {
    id: '2', name: 'Legging Azul Marinho com Faixa Lateral Branca', price: 99.90, oldPrice: 129.90, image: '/produtos/legging-2.jpg', images: ['/produtos/legging-2.jpg', '/produtos/legging-1.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['PP', 'P', 'M', 'G', 'GG'], colors: [{ name: 'Azul Marinho', hex: '#1a1a5e' }, { name: 'Preto', hex: '#000000' }], description: 'Legging com faixa lateral branca que alonga a silhueta. Modelo clássico e elegante para qualquer modalidade.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Faixa lateral', 'Cós alto', 'Modelagem clássica'], rating: 4.6, reviewCount: 78, isSale: true, sku: 'LUF-LG-007',
  },
  {
    id: '3', name: 'Legging Turquesa Scrunch Butt', price: 109.90, image: '/produtos/legging-3.jpg', images: ['/produtos/legging-3.jpg', '/produtos/legging-4.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Turquesa', hex: '#2DD4A8' }, { name: 'Rosa', hex: '#FF69B4' }, { name: 'Preto', hex: '#000000' }], description: 'Legging com efeito scrunch no bumbum que valoriza e levanta. Modelo mais vendido da coleção.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Efeito scrunch', 'Cós alto', 'Alta compressão'], rating: 4.9, reviewCount: 215, isNew: true, sku: 'LUF-LG-010',
  },
  {
    id: '4', name: 'Legging Lilás com Bolso Lateral', price: 119.90, image: '/produtos/legging-4.jpg', images: ['/produtos/legging-4.jpg', '/produtos/legging-1.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['P', 'M', 'G'], colors: [{ name: 'Lilás', hex: '#C8A2C8' }, { name: 'Preto', hex: '#000000' }], description: 'Legging lilás com bolso lateral para celular. Modelo prático e confortável.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Bolso lateral', 'Cós alto', 'Alta compressão'], rating: 4.6, reviewCount: 48, isNew: true, sku: 'LUF-LG-014',
  },
  {
    id: '5', name: 'Legging Cintura Alta Preta Sem Costura', price: 99.90, oldPrice: 139.90, image: '/produtos/legging-1.jpg', images: ['/produtos/legging-1.jpg', '/produtos/legging-2.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza Chumbo', hex: '#36454F' }], description: 'Legging cintura alta sem costura. Modelo premium com acabamento impecável.', specifications: ['Composição: 94% Poliamida, 6% Elastano', 'Sem costura', 'Cintura alta', 'Premium'], rating: 4.8, reviewCount: 167, isSale: true, sku: 'LUF-LG-020',
  },
  {
    id: '6', name: 'Legging Vermelha Power Compression', price: 129.90, oldPrice: 169.90, image: '/produtos/legging-5.jpg', images: ['/produtos/legging-5.jpg', '/produtos/legging-1.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Vermelho', hex: '#E53935' }, { name: 'Preto', hex: '#000000' }], description: 'Legging vermelha de alta compressão com tecnologia anti odor. Ideal para treinos intensos.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Anti odor', 'Alta compressão', 'Cós alto'], rating: 4.7, reviewCount: 92, isSale: true, sku: 'LUF-LG-021',
  },
  {
    id: '7', name: 'Legging Bootcut Evasê Preta', price: 119.90, image: '/produtos/legging-2.jpg', images: ['/produtos/legging-2.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Legging modelo bootcut com corte evasê na barra. Versátil para treino e uso casual.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Modelo bootcut', 'Cós alto', 'Versátil'], rating: 4.5, reviewCount: 34, sku: 'LUF-LG-022',
  },
  {
    id: '8', name: 'Legging Cós Transparente Preto', price: 109.90, oldPrice: 149.90, image: '/produtos/legging-3.jpg', images: ['/produtos/legging-3.jpg', '/produtos/legging-4.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }], description: 'Legging com detalhe de tule transparente no cós. Modelo estiloso e diferenciado.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Detalhe em tule', 'Cós diferenciado', 'Não transparente'], rating: 4.6, reviewCount: 56, isSale: true, sku: 'LUF-LG-023',
  },
  // FEMININO - Tops (8 produtos)
  {
    id: '9', name: 'Top Fitness Feminino com Recortes Preto Básico', price: 59.90, oldPrice: 79.90, image: '/produtos/top-1.jpg', images: ['/produtos/top-1.jpg', '/produtos/top-2.jpg', '/produtos/top-3.jpg'], category: 'tops', subcategory: 'Tops & Croppeds', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Turquesa', hex: '#2DD4A8' }, { name: 'Preto', hex: '#000000' }, { name: 'Rosa', hex: '#FF69B4' }], description: 'Top fitness com recortes estratégicos que proporcionam respirabilidade e estilo. Possui bojo removível.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Bojo removível', 'Alças reguláveis', 'Média sustentação'], rating: 4.7, reviewCount: 89, isSale: true, sku: 'LUF-TP-002',
  },
  {
    id: '10', name: 'Top Cropped Rosa com Tule nas Costas', price: 69.90, image: '/produtos/top-2.jpg', images: ['/produtos/top-2.jpg', '/produtos/top-1.jpg'], category: 'tops', subcategory: 'Tops & Croppeds', sizes: ['P', 'M', 'G'], colors: [{ name: 'Rosa', hex: '#FF69B4' }, { name: 'Preto', hex: '#000000' }, { name: 'Vinho', hex: '#722F37' }], description: 'Top cropped com detalhe em tule nas costas. Modelo estiloso que combina funcionalidade e beleza.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Tule nas costas', 'Bojo removível', 'Alta sustentação'], rating: 4.8, reviewCount: 52, isNew: true, sku: 'LUF-TP-008',
  },
  {
    id: '11', name: 'Top Neon Verde Cruzado nas Costas', price: 74.90, oldPrice: 99.90, image: '/produtos/top-4.jpg', images: ['/produtos/top-4.jpg', '/produtos/top-1.jpg'], category: 'tops', subcategory: 'Tops & Croppeds', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Neon Verde', hex: '#7FFF00' }, { name: 'Preto', hex: '#000000' }], description: 'Top esportivo neon com alças cruzadas nas costas. Alta sustentação para treinos de impacto.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Alças cruzadas', 'Alta sustentação', 'Tecido neon'], rating: 4.6, reviewCount: 43, isSale: true, sku: 'LUF-TP-009',
  },
  {
    id: '12', name: 'Top Longline com Mesh Preto', price: 79.90, image: '/produtos/top-5.jpg', images: ['/produtos/top-5.jpg', '/produtos/top-1.jpg'], category: 'tops', subcategory: 'Tops & Croppeds', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Branco', hex: '#FFFFFF' }], description: 'Top longline com recortes em mesh transpirável. Modelo moderno e super confortável.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Recortes em mesh', 'Longline', 'Bojo removível'], rating: 4.7, reviewCount: 67, isNew: true, sku: 'LUF-TP-010',
  },
  {
    id: '13', name: 'Top Sports Branco com Detalhe em Tule', price: 74.90, image: '/produtos/top-3.jpg', images: ['/produtos/top-3.jpg', '/produtos/top-1.jpg'], category: 'praia', subcategory: 'Moda Praia', sizes: ['P', 'M', 'G'], colors: [{ name: 'Branco', hex: '#FFFFFF' }, { name: 'Preto', hex: '#000000' }], description: 'Top esportivo branco com detalhes em tule. Perfeito para treinos e praia.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Detalhes em tule', 'Versátil', 'Bojo removível'], rating: 4.6, reviewCount: 45, sku: 'LUF-MP-019',
  },
  {
    id: '14', name: 'Cropped Básico Dry Fit Preto', price: 49.90, oldPrice: 69.90, image: '/produtos/top-1.jpg', images: ['/produtos/top-1.jpg', '/produtos/top-2.jpg'], category: 'tops', subcategory: 'Tops & Croppeds', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Branco', hex: '#FFFFFF' }, { name: 'Cinza', hex: '#808080' }], description: 'Cropped básico dry fit, essencial para qualquer treino. Tecido leve e de secagem rápida.', specifications: ['Composição: 100% Poliéster', 'Tecnologia Dry Fit', 'Leve', 'Secagem rápida'], rating: 4.4, reviewCount: 112, isSale: true, sku: 'LUF-TP-011',
  },
  {
    id: '15', name: 'Top Tomara Que Caia com Bojo', price: 64.90, image: '/produtos/top-2.jpg', images: ['/produtos/top-2.jpg', '/produtos/top-3.jpg'], category: 'tops', subcategory: 'Tops & Croppeds', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Nude', hex: '#F5C6A5' }], description: 'Top modelo tomara que caia com bojo fixo. Ideal para yoga e pilates.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Bojo fixo', 'Modelo strapless', 'Confortável'], rating: 4.5, reviewCount: 38, sku: 'LUF-TP-012',
  },
  {
    id: '16', name: 'Top Nadador Preto com Bojo Fixo', price: 59.90, oldPrice: 79.90, image: '/produtos/top-1.jpg', images: ['/produtos/top-1.jpg', '/produtos/top-3.jpg'], category: 'tops', subcategory: 'Tops & Croppeds', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Vermelho', hex: '#E53935' }], description: 'Top modelo nadador com bojo fixo. Excelente sustentação para treinos intensos.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Bojo fixo', 'Alta sustentação', 'Modelo nadador'], rating: 4.5, reviewCount: 82, isSale: true, sku: 'LUF-TP-024',
  },
  // Conjuntos (5 produtos)
  {
    id: '17', name: 'Conjunto Fitness Estampado Preto e Cinza', price: 149.90, oldPrice: 199.90, image: '/produtos/conjunto-1.jpg', images: ['/produtos/conjunto-1.jpg', '/produtos/top-2.jpg', '/produtos/short-2.jpg'], category: 'conjuntos', subcategory: 'Conjuntos', sizes: ['P', 'M', 'G'], colors: [{ name: 'Estampado', hex: '#333333' }], description: 'Conjunto fitness completo com top e shorts estampados. Tecido de alta compressão com estampa exclusiva LUFIT.', specifications: ['Composição: 85% Poliamida, 15% Elastano', 'Estampa exclusiva', 'Alta compressão', 'Shorts com bolso lateral'], rating: 4.9, reviewCount: 67, isNew: true, isSale: true, sku: 'LUF-CJ-003',
  },
  {
    id: '18', name: 'Conjunto Turquesa Top e Legging', price: 179.90, oldPrice: 229.90, image: '/produtos/legging-3.jpg', images: ['/produtos/legging-3.jpg', '/produtos/top-1.jpg'], category: 'conjuntos', subcategory: 'Conjuntos', sizes: ['P', 'M', 'G'], colors: [{ name: 'Turquesa', hex: '#2DD4A8' }, { name: 'Preto', hex: '#000000' }, { name: 'Rosa', hex: '#FF69B4' }], description: 'Conjunto completo top e legging na cor turquesa. Look completo para seu treino.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Look completo', 'Alta compressão', 'Bojo removível'], rating: 4.8, reviewCount: 89, isSale: true, sku: 'LUF-CJ-015',
  },
  {
    id: '19', name: 'Conjunto Preto e Cinza com Top e Short', price: 139.90, image: '/produtos/conjunto-1.jpg', images: ['/produtos/conjunto-1.jpg', '/produtos/short-2.jpg'], category: 'conjuntos', subcategory: 'Conjuntos', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto/Cinza', hex: '#333333' }], description: 'Conjunto com top e short estampado preto e cinza. Look completo e coordenado.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Estampado', 'Look completo', 'Confortável'], rating: 4.6, reviewCount: 55, sku: 'LUF-CJ-022',
  },
  {
    id: '20', name: 'Conjunto Fit Rosa Calça e Top', price: 159.90, oldPrice: 209.90, image: '/produtos/legging-4.jpg', images: ['/produtos/legging-4.jpg', '/produtos/top-2.jpg'], category: 'conjuntos', subcategory: 'Conjuntos', sizes: ['P', 'M', 'G'], colors: [{ name: 'Rosa', hex: '#FF69B4' }, { name: 'Preto', hex: '#000000' }], description: 'Conjunto fit na cor rosa com legging e top coordenados. Look feminino e poderoso.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Look coordenado', 'Alta compressão', 'Modelagem fit'], rating: 4.7, reviewCount: 71, isSale: true, sku: 'LUF-CJ-025',
  },
  {
    id: '21', name: 'Conjunto Basic Preto Top e Bermuda', price: 129.90, image: '/produtos/top-5.jpg', images: ['/produtos/top-5.jpg', '/produtos/short-1.jpg'], category: 'conjuntos', subcategory: 'Conjuntos', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Branco', hex: '#FFFFFF' }], description: 'Conjunto básico preto com top e bermuda biker. Essencial para qualquer guarda-roupa fitness.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Look básico', 'Versátil', 'Confortável'], rating: 4.5, reviewCount: 93, sku: 'LUF-CJ-026',
  },
  // Shorts (5 produtos)
  {
    id: '22', name: 'Bermuda Biker Coral Alta Compressão', price: 79.90, image: '/produtos/short-1.jpg', images: ['/produtos/short-1.jpg', '/produtos/legging-3.jpg'], category: 'shorts', subcategory: 'Shorts & Bermudas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Coral', hex: '#FF7F50' }, { name: 'Preto', hex: '#000000' }, { name: 'Turquesa', hex: '#2DD4A8' }], description: 'Bermuda biker de alta compressão, modelo ideal para treinos intensos. Cós alto que modela a cintura.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Alta compressão', 'Cós alto', 'Não marca'], rating: 4.6, reviewCount: 93, isNew: true, sku: 'LUF-SH-004',
  },
  {
    id: '23', name: 'Bermuda Biker Estampada Preto e Branco', price: 84.90, oldPrice: 99.90, image: '/produtos/short-2.jpg', images: ['/produtos/short-2.jpg', '/produtos/short-1.jpg'], category: 'shorts', subcategory: 'Shorts & Bermudas', sizes: ['P', 'M', 'G'], colors: [{ name: 'Estampada', hex: '#333333' }], description: 'Bermuda biker com estampa geométrica preto e branco. Modelo estiloso para treinos.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Estampa geométrica', 'Cós alto', 'Bolso lateral'], rating: 4.5, reviewCount: 43, isSale: true, sku: 'LUF-SH-011',
  },
  {
    id: '24', name: 'Short Saia Fitness Preto com Short Interno', price: 79.90, image: '/produtos/short-1.jpg', images: ['/produtos/short-1.jpg', '/produtos/short-2.jpg'], category: 'shorts', subcategory: 'Shorts & Bermudas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Short saia com short interno de compressão. Modelo versátil para treino ou uso casual.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Short interno', 'Modelo saia', 'Versátil'], rating: 4.5, reviewCount: 62, sku: 'LUF-SH-016',
  },
  {
    id: '25', name: 'Bermuda Running Preta com Refletivo', price: 69.90, image: '/produtos/short-2.jpg', images: ['/produtos/short-2.jpg', '/produtos/short-1.jpg'], category: 'shorts', subcategory: 'Shorts & Bermudas', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Bermuda running com detalhes refletivos. Ideal para corridas noturnas.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Detalhes refletivos', 'Leve', 'Ideal para corrida'], rating: 4.4, reviewCount: 29, sku: 'LUF-SH-023',
  },
  {
    id: '26', name: 'Shorts Comfort Azul Marinho', price: 64.90, oldPrice: 84.90, image: '/produtos/short-1.jpg', images: ['/produtos/short-1.jpg'], category: 'shorts', subcategory: 'Shorts & Bermudas', sizes: ['P', 'M', 'G'], colors: [{ name: 'Azul Marinho', hex: '#1a1a5e' }, { name: 'Preto', hex: '#000000' }], description: 'Shorts comfort com cós largo e modelagem solta. Conforto máximo para treinos leves.', specifications: ['Composição: 92% Poliamida, 8% Elastano', 'Cós largo', 'Modelo comfort', 'Leve'], rating: 4.3, reviewCount: 41, isSale: true, sku: 'LUF-SH-027',
  },
  // Blusas (5 produtos)
  {
    id: '27', name: 'Regata Fitness Nadador Preto', price: 49.90, image: '/produtos/blusa-1.jpg', images: ['/produtos/blusa-1.jpg', '/produtos/blusa-2.jpg'], category: 'blusas', subcategory: 'Blusas & Camisetas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Branco', hex: '#FFFFFF' }, { name: 'Cinza', hex: '#808080' }], description: 'Regata com recorte nadador nas costas, modelo leve e respirável. Perfeita para treinos de alta intensidade.', specifications: ['Composição: 92% Poliamida, 8% Elastano', 'Modelo nadador', 'Tecido leve', 'Secagem ultra rápida'], rating: 4.5, reviewCount: 56, sku: 'LUF-BL-005',
  },
  {
    id: '28', name: 'Cropped Manga Longa Sem Costura Cinza', price: 89.90, image: '/produtos/blusa-2.jpg', images: ['/produtos/blusa-2.jpg', '/produtos/blusa-1.jpg'], category: 'blusas', subcategory: 'Blusas & Camisetas', sizes: ['P', 'M', 'G'], colors: [{ name: 'Cinza', hex: '#808080' }, { name: 'Preto', hex: '#000000' }, { name: 'Bege', hex: '#F5F5DC' }], description: 'Cropped manga longa sem costura, modelo que se adapta perfeitamente ao corpo. Tecido macio.', specifications: ['Composição: 94% Poliamida, 6% Elastano', 'Sem costura', 'Cropped', 'Manga longa'], rating: 4.7, reviewCount: 41, isNew: true, sku: 'LUF-BL-006',
  },
  {
    id: '29', name: 'Blusa Térmica Manga Longa Cinza Mescla', price: 99.90, image: '/produtos/blusa-2.jpg', images: ['/produtos/blusa-2.jpg', '/produtos/casaco-1.jpg'], category: 'blusas', subcategory: 'Blusas & Camisetas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Cinza Mescla', hex: '#9EA7B0' }, { name: 'Preto', hex: '#000000' }], description: 'Blusa térmica manga longa, ideal para treinos em dias frios ou como segunda pele.', specifications: ['Composição: 92% Poliamida, 8% Elastano', 'Térmica', 'Manga longa', 'Segunda pele'], rating: 4.5, reviewCount: 33, sku: 'LUF-BL-021',
  },
  {
    id: '30', name: 'Blusa Dry Fit Manga Curta Preta', price: 54.90, image: '/produtos/blusa-1.jpg', images: ['/produtos/blusa-1.jpg', '/produtos/blusa-2.jpg'], category: 'blusas', subcategory: 'Blusas & Camisetas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Branco', hex: '#FFFFFF' }, { name: 'Rosa', hex: '#FF69B4' }], description: 'Blusa dry fit manga curta, modelo básico e essencial para qualquer atleta.', specifications: ['Composição: 100% Poliéster', 'Tecnologia Dry Fit', 'Manga curta', 'Anti odor'], rating: 4.3, reviewCount: 105, sku: 'LUF-BL-017',
  },
  {
    id: '31', name: 'Camiseta Oversized Fitness Branca', price: 69.90, oldPrice: 89.90, image: '/produtos/blusa-2.jpg', images: ['/produtos/blusa-2.jpg'], category: 'blusas', subcategory: 'Blusas & Camisetas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Branco', hex: '#FFFFFF' }, { name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Camiseta oversized fitness, modelo solto e confortável. Perfeita para o pós-treino.', specifications: ['Composição: 95% Algodão, 5% Elastano', 'Modelo oversized', 'Confortável', 'Casual'], rating: 4.4, reviewCount: 78, isSale: true, sku: 'LUF-BL-028',
  },
  // Macacões (4 produtos)
  {
    id: '32', name: 'Macacão Longo Preto com Zíper Frontal', price: 189.90, oldPrice: 249.90, image: '/produtos/macacao-1.jpg', images: ['/produtos/macacao-1.jpg', '/produtos/legging-1.jpg'], category: 'macacoes', subcategory: 'Macacões', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }], description: 'Macacão longo com zíper frontal e gola alta. Modelo sofisticado que valoriza a silhueta.', specifications: ['Composição: 85% Poliamida, 15% Elastano', 'Zíper frontal', 'Gola alta', 'Modelagem contorno'], rating: 4.9, reviewCount: 34, isSale: true, sku: 'LUF-MC-009',
  },
  {
    id: '33', name: 'Macaquinho Fitness Preto com Recortes', price: 129.90, oldPrice: 169.90, image: '/produtos/conjunto-1.jpg', images: ['/produtos/conjunto-1.jpg', '/produtos/macacao-1.jpg'], category: 'macaquinhos', subcategory: 'Macaquinhos', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Macaquinho fitness com recortes estratégicos. Modelo all-in-one prático e estiloso.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Modelo all-in-one', 'Recortes estratégicos', 'Cós alto'], rating: 4.7, reviewCount: 38, isSale: true, sku: 'LUF-MQ-018',
  },
  {
    id: '34', name: 'Macacão Curto Open Back Verde', price: 149.90, image: '/produtos/macacao-1.jpg', images: ['/produtos/macacao-1.jpg', '/produtos/top-2.jpg'], category: 'macacoes', subcategory: 'Macacões', sizes: ['P', 'M', 'G'], colors: [{ name: 'Verde', hex: '#2DD4A8' }, { name: 'Preto', hex: '#000000' }], description: 'Macacão curto com decote nas costas. Modelo elegante para treinos ou saídas casuais.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Decote nas costas', 'Macaquinho curto', 'Elegante'], rating: 4.6, reviewCount: 52, isNew: true, sku: 'LUF-MC-029',
  },
  {
    id: '35', name: 'Macaquinho Kids Estampado Infantil', price: 89.90, image: '/produtos/inf-2.jpg', images: ['/produtos/inf-2.jpg', '/produtos/inf-1.jpg'], category: 'macaquinhos', subcategory: 'Macaquinhos', sizes: ['P', 'M', 'G'], colors: [{ name: 'Estampado', hex: '#333333' }], description: 'Macaquinho infantil estampado. Confortável e resistente para as brincadeiras.', specifications: ['Composição: 92% Algodão, 8% Elastano', 'Infantil', 'Resistente', 'Confortável'], rating: 4.7, reviewCount: 24, sku: 'LUF-MQ-030',
  },
  // Casacos (3 produtos)
  {
    id: '36', name: 'Jaqueta Corta-Vento Preta com Capuz', price: 159.90, image: '/produtos/casaco-1.jpg', images: ['/produtos/casaco-1.jpg'], category: 'casacos', subcategory: 'Casacos & Jaquetas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Jaqueta corta-vento com capuz e bolsos frontais. Ideal para aquecimento antes dos treinos.', specifications: ['Composição: 100% Poliéster', 'Capuz removível', 'Bolsos frontais', 'Corta-vento'], rating: 4.4, reviewCount: 28, sku: 'LUF-CA-013',
  },
  {
    id: '37', name: 'Blusão Moletom Oversized Cinza', price: 139.90, oldPrice: 179.90, image: '/produtos/blusa-2.jpg', images: ['/produtos/blusa-2.jpg', '/produtos/casaco-1.jpg'], category: 'casacos', subcategory: 'Casacos & Jaquetas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Cinza', hex: '#808080' }, { name: 'Preto', hex: '#000000' }, { name: 'Rosa', hex: '#FF69B4' }], description: 'Blusão de moletom oversized, quentinho e super confortável. Ideal para o inverno.', specifications: ['Composição: 80% Algodão, 20% Poliéster', 'Moletom', 'Oversized', 'Quentinho'], rating: 4.8, reviewCount: 86, isSale: true, sku: 'LUF-CA-031',
  },
  {
    id: '38', name: 'Colete Aquecedor Preto Fitness', price: 99.90, image: '/produtos/casaco-1.jpg', images: ['/produtos/casaco-1.jpg'], category: 'casacos', subcategory: 'Casacos & Jaquetas', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Branco', hex: '#FFFFFF' }], description: 'Colete aquecedor leve, perfeito para caminhadas e treinos ao ar livre.', specifications: ['Composição: 100% Poliéster', 'Leve', 'Aquecedor', 'Para outdoor'], rating: 4.3, reviewCount: 19, sku: 'LUF-CA-032',
  },
  // MASCULINO (6 produtos)
  {
    id: '39', name: 'Regata Masculina Dry Fit Preta', price: 59.90, oldPrice: 79.90, image: '/produtos/masc-1.jpg', images: ['/produtos/masc-1.jpg', '/produtos/masc-2.jpg'], category: 'masculino', subcategory: 'Masculino', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }, { name: 'Branco', hex: '#FFFFFF' }], description: 'Regata masculina dry fit, modelo leve e respirável para treinos intensos. Tecnologia anti odor.', specifications: ['Composição: 100% Poliéster', 'Tecnologia Dry Fit', 'Anti odor', 'Secagem rápida'], rating: 4.6, reviewCount: 72, isSale: true, sku: 'LUF-MS-001',
  },
  {
    id: '40', name: 'Bermuda Masculina Training Azul Marinho', price: 79.90, image: '/produtos/masc-2.jpg', images: ['/produtos/masc-2.jpg', '/produtos/masc-3.jpg'], category: 'masculino', subcategory: 'Masculino', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Azul Marinho', hex: '#1a1a5e' }, { name: 'Preto', hex: '#000000' }], description: 'Bermuda masculina de treino com bolso lateral e cós com elástico interno. Confortável.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Bolso lateral', 'Cós com elástico', 'Secagem rápida'], rating: 4.5, reviewCount: 45, sku: 'LUF-MS-002',
  },
  {
    id: '41', name: 'Camiseta Masculina Compressão Cinza', price: 89.90, oldPrice: 109.90, image: '/produtos/masc-3.jpg', images: ['/produtos/masc-3.jpg', '/produtos/masc-1.jpg'], category: 'masculino', subcategory: 'Masculino', sizes: ['P', 'M', 'G'], colors: [{ name: 'Cinza', hex: '#808080' }, { name: 'Preto', hex: '#000000' }], description: 'Camiseta masculina de compressão, modelagem que valoriza a musculatura. Alta performance.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Compressão leve', 'Modelagem fit', 'Anti odor'], rating: 4.7, reviewCount: 58, isSale: true, sku: 'LUF-MS-003',
  },
  {
    id: '42', name: 'Calça Masculina Compressão Térmica Preta', price: 119.90, image: '/produtos/masc-4.jpg', images: ['/produtos/masc-4.jpg', '/produtos/masc-3.jpg'], category: 'masculino', subcategory: 'Masculino', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Calça masculina de compressão térmica, ideal para treinos em dias frios.', specifications: ['Composição: 85% Poliamida, 15% Elastano', 'Compressão', 'Térmica', 'Secagem rápida'], rating: 4.6, reviewCount: 39, sku: 'LUF-MS-033',
  },
  {
    id: '43', name: 'Moletom Masculino com Capuz Preto', price: 149.90, oldPrice: 199.90, image: '/produtos/masc-1.jpg', images: ['/produtos/masc-1.jpg', '/produtos/masc-2.jpg'], category: 'masculino', subcategory: 'Masculino', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }, { name: 'Azul', hex: '#1a1a5e' }], description: 'Moletom masculino com capuz e bolsos frontais. Quentinho e estiloso para o inverno.', specifications: ['Composição: 80% Algodão, 20% Poliéster', 'Capuz', 'Bolsos frontais', 'Quentinho'], rating: 4.7, reviewCount: 64, isSale: true, sku: 'LUF-MS-034',
  },
  {
    id: '44', name: 'Camiseta Polo Fitness Masculina Azul', price: 79.90, image: '/produtos/masc-3.jpg', images: ['/produtos/masc-3.jpg'], category: 'masculino', subcategory: 'Masculino', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Azul', hex: '#1a1a5e' }, { name: 'Preto', hex: '#000000' }, { name: 'Branco', hex: '#FFFFFF' }], description: 'Camiseta polo fitness masculina com gola e botões. Estilo casual esportivo.', specifications: ['Composição: 95% Poliéster, 5% Elastano', 'Gola polo', 'Casual esportivo', 'Secagem rápida'], rating: 4.4, reviewCount: 28, sku: 'LUF-MS-035',
  },
  // INFANTIL (6 produtos)
  {
    id: '45', name: 'Conjunto Infantil Menina Rosa Legging e Top', price: 79.90, image: '/produtos/inf-1.jpg', images: ['/produtos/inf-1.jpg', '/produtos/inf-2.jpg'], category: 'infantil', subcategory: 'Linha Infantil', sizes: ['4', '6', '8', '10', '12'], colors: [{ name: 'Rosa', hex: '#FF69B4' }, { name: 'Preto', hex: '#000000' }], description: 'Conjunto infantil para meninas com legging e top. Tecido macio e confortável.', specifications: ['Composição: 92% Poliamida, 8% Elastano', 'Tecido macio', 'Modelo confortável', 'Cós elástico'], rating: 4.8, reviewCount: 32, isNew: true, sku: 'LUF-IN-001',
  },
  {
    id: '46', name: 'Shorts Infantil Menina com Listras Coloridas', price: 49.90, image: '/produtos/inf-2.jpg', images: ['/produtos/inf-2.jpg', '/produtos/inf-1.jpg'], category: 'infantil', subcategory: 'Linha Infantil', sizes: ['4', '6', '8', '10', '12'], colors: [{ name: 'Preto/Listra', hex: '#333333' }], description: 'Shorts infantil com listras coloridas laterais. Modelo esportivo para meninas ativas.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Listras laterais', 'Cós elástico', 'Confortável'], rating: 4.5, reviewCount: 18, sku: 'LUF-IN-002',
  },
  {
    id: '47', name: 'Bermuda Infantil Menino Azul Esporte', price: 54.90, image: '/produtos/inf-3.jpg', images: ['/produtos/inf-3.jpg'], category: 'infantil', subcategory: 'Linha Infantil', sizes: ['4', '6', '8', '10', '12'], colors: [{ name: 'Azul', hex: '#1a1a5e' }, { name: 'Preto', hex: '#000000' }], description: 'Bermuda infantil masculina para esportes. Tecido leve e resistente, ideal para brincadeiras.', specifications: ['Composição: 100% Poliéster', 'Tecido leve', 'Resistente', 'Secagem rápida'], rating: 4.6, reviewCount: 22, sku: 'LUF-IN-003',
  },
  {
    id: '48', name: 'Conjunto Infantil Menino Camiseta e Short', price: 69.90, oldPrice: 89.90, image: '/produtos/inf-3.jpg', images: ['/produtos/inf-3.jpg', '/produtos/inf-2.jpg'], category: 'infantil', subcategory: 'Linha Infantil', sizes: ['4', '6', '8', '10', '12'], colors: [{ name: 'Azul/Preto', hex: '#1a1a5e' }], description: 'Conjunto infantil masculino com camiseta e short. Confortável para brincadeiras ao ar livre.', specifications: ['Composição: 100% Algodão', 'Confortável', 'Resistente', 'Para brincadeiras'], rating: 4.7, reviewCount: 35, isSale: true, sku: 'LUF-IN-036',
  },
  {
    id: '49', name: 'Macacão Infantil Menina Rosa Florido', price: 89.90, image: '/produtos/inf-1.jpg', images: ['/produtos/inf-1.jpg', '/produtos/inf-2.jpg'], category: 'infantil', subcategory: 'Linha Infantil', sizes: ['4', '6', '8', '10'], colors: [{ name: 'Rosa', hex: '#FF69B4' }], description: 'Macacão infantil rosa com estampa floral. Super fofinho e confortável.', specifications: ['Composição: 95% Algodão, 5% Elastano', 'Estampa floral', 'Fofinho', 'Confortável'], rating: 4.9, reviewCount: 47, isNew: true, sku: 'LUF-IN-037',
  },
  {
    id: '50', name: 'Legging Infantil Menina Brilhante Preta', price: 59.90, image: '/produtos/inf-1.jpg', images: ['/produtos/inf-1.jpg'], category: 'infantil', subcategory: 'Linha Infantil', sizes: ['4', '6', '8', '10', '12'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Rosa', hex: '#FF69B4' }], description: 'Legging infantil com brilho sutil. Modelo confortável e divertido para as pequenas.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Brilho sutil', 'Confortável', 'Divertido'], rating: 4.6, reviewCount: 26, sku: 'LUF-IN-038',
  },
  // Moda Praia (5 produtos)
  {
    id: '51', name: 'Maiô Fitness com Recortes Preto', price: 129.90, oldPrice: 169.90, image: '/produtos/top-5.jpg', images: ['/produtos/top-5.jpg', '/produtos/legging-1.jpg'], category: 'praia', subcategory: 'Moda Praia', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Azul', hex: '#1a1a5e' }], description: 'Maiô fitness com recortes estratégicos. Serve tanto para treino quanto para praia.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Recortes', 'Versátil', 'Bojo removível'], rating: 4.7, reviewCount: 54, isSale: true, sku: 'LUF-MP-039',
  },
  {
    id: '52', name: 'Biquíni Esportivo Top e Calcinha Turquesa', price: 99.90, image: '/produtos/top-3.jpg', images: ['/produtos/top-3.jpg', '/produtos/short-1.jpg'], category: 'praia', subcategory: 'Moda Praia', sizes: ['P', 'M', 'G'], colors: [{ name: 'Turquesa', hex: '#2DD4A8' }, { name: 'Preto', hex: '#000000' }], description: 'Biquíni esportivo com top estilo cropped e calcinha de cós alto. Confortável e estiloso.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Top cropped', 'Cós alto', 'Esportivo'], rating: 4.6, reviewCount: 41, sku: 'LUF-MP-040',
  },
  {
    id: '53', name: 'Saída de Praia Tela Branca Transparente', price: 79.90, image: '/produtos/blusa-1.jpg', images: ['/produtos/blusa-1.jpg'], category: 'praia', subcategory: 'Moda Praia', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Branco', hex: '#FFFFFF' }, { name: 'Preto', hex: '#000000' }], description: 'Saída de praia em tela transparente. Estilosa e leve para usar sobre o biquíni.', specifications: ['Composição: 100% Poliéster', 'Tela transparente', 'Leve', 'Estilosa'], rating: 4.5, reviewCount: 33, sku: 'LUF-MP-041',
  },
  {
    id: '54', name: 'Canga Multifuncional Estampada', price: 49.90, oldPrice: 69.90, image: '/produtos/conjunto-1.jpg', images: ['/produtos/conjunto-1.jpg'], category: 'praia', subcategory: 'Moda Praia', sizes: ['U'], colors: [{ name: 'Estampada', hex: '#333333' }], description: 'Canga multifuncional estampada. Pode ser usada como saída de praia, pareô ou toalha.', specifications: ['Composição: 100% Viscose', 'Multifuncional', 'Estampada', 'Leve'], rating: 4.3, reviewCount: 19, isSale: true, sku: 'LUF-MP-042',
  },
  {
    id: '55', name: 'Sunga Boxer Masculina Preta', price: 69.90, image: '/produtos/masc-2.jpg', images: ['/produtos/masc-2.jpg'], category: 'praia', subcategory: 'Moda Praia', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Azul', hex: '#1a1a5e' }], description: 'Sunga boxer masculina modelo esportivo. Confortável e de secagem rápida.', specifications: ['Composição: 82% Poliamida, 18% Elastano', 'Modelo boxer', 'Secagem rápida', 'Esportivo'], rating: 4.5, reviewCount: 37, sku: 'LUF-MP-043',
  },
  // LUPO (4 produtos)
  {
    id: '56', name: 'Legging Lupo Sport Max Preta', price: 184.99, oldPrice: 219.99, image: '/produtos/legging-1.jpg', images: ['/produtos/legging-1.jpg', '/produtos/legging-3.jpg'], category: 'lupo', subcategory: 'Leggings', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#666666' }], description: 'Legging Lupo Sport Max com tecido texturizado a ar. Alta compressão, respirável e sem transparência. Tecnologia Seamless Dry.', specifications: ['Composição: 96% Poliamida, 4% Elastano', 'Tecnologia Seamless Dry', 'Sem costura', 'Alta compressão'], rating: 4.8, reviewCount: 128, isSale: true, sku: 'LUP-LG-001',
  },
  {
    id: '57', name: 'Legging Lupo Pocket 5 Bolsos', price: 175.74, oldPrice: 184.99, image: '/produtos/legging-3.jpg', images: ['/produtos/legging-3.jpg', '/produtos/legging-1.jpg'], category: 'lupo', subcategory: 'Leggings', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Marinho', hex: '#1a1a5e' }], description: 'Legging Lupo com 5 bolsos estratégicos. Ideal para corrida e treino outdoor. Tecido de alta compressão com secagem rápida.', specifications: ['Composição: 96% Poliamida, 4% Elastano', '5 bolsos', 'Secagem rápida', 'Alta compressão'], rating: 4.7, reviewCount: 94, isSale: true, sku: 'LUP-LG-002',
  },
  {
    id: '58', name: 'Camiseta Lupo Dry Fit Branca', price: 69.90, image: '/produtos/blusa-1.jpg', images: ['/produtos/blusa-1.jpg'], category: 'lupo', subcategory: 'Camisetas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Branco', hex: '#FFFFFF' }, { name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#999999' }], description: 'Camiseta Lupo Dry Fit com tecnologia de secagem ultrarrápida. Leve, respirável e confortável para qualquer treino.', specifications: ['Composição: 100% Poliéster', 'Dry Fit', 'Secagem rápida', 'Leve'], rating: 4.5, reviewCount: 67, sku: 'LUP-CM-003',
  },
  {
    id: '59', name: 'Conjunto Lupo Legging + Top', price: 129.90, oldPrice: 159.90, image: '/produtos/conjunto-1.jpg', images: ['/produtos/conjunto-1.jpg', '/produtos/top-1.jpg'], category: 'lupo', subcategory: 'Conjuntos', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Rosa', hex: '#FF69B4' }], description: 'Conjunto Lupo com legging de alta compressão e top com sustentação média. Kit completo para seu treino.', specifications: ['Composição: 96% Poliamida, 4% Elastano', 'Alta compressão', 'Sustentação média', 'Conjunto completo'], rating: 4.6, reviewCount: 83, isSale: true, sku: 'LUP-CJ-004',
  },
  // SELENE (4 produtos)
  {
    id: '60', name: 'Conjunto Selene Top + Shorts Canelado', price: 116.37, oldPrice: 159.90, image: '/produtos/top-1.jpg', images: ['/produtos/top-1.jpg', '/produtos/short-1.jpg'], category: 'selene', subcategory: 'Conjuntos', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Rosa', hex: '#FF69B4' }, { name: 'Preto', hex: '#000000' }, { name: 'Azul Marinho', hex: '#1a1a5e' }], description: 'Conjunto Selene canelado sem costura. Top com bojo removível e shorts de cós alto. Zero transparência e máximo conforto.', specifications: ['Composição: 93% Poliamida, 7% Elastano', 'Sem costura', 'Bojo removível', 'Zero transparência'], rating: 4.9, reviewCount: 156, isSale: true, sku: 'SEL-CJ-001',
  },
  {
    id: '61', name: 'Top Selene com Bojo Removível Azul', price: 52.11, image: '/produtos/top-3.jpg', images: ['/produtos/top-3.jpg', '/produtos/top-1.jpg'], category: 'selene', subcategory: 'Top', sizes: ['P', 'M', 'G'], colors: [{ name: 'Azul Marinho', hex: '#1a1a5e' }, { name: 'Preto', hex: '#000000' }, { name: 'Rosa', hex: '#FF69B4' }], description: 'Top Selene com bojo removível e alças reguláveis. Modelo nadador com sustentação perfeita. Tecido macio e respirável.', specifications: ['Composição: 93% Poliamida, 7% Elastano', 'Bojo removível', 'Alças reguláveis', 'Respirável'], rating: 4.7, reviewCount: 112, sku: 'SEL-TP-002',
  },
  {
    id: '62', name: 'Legging Selene Básica Sem Costura', price: 69.90, image: '/produtos/legging-5.jpg', images: ['/produtos/legging-5.jpg', '/produtos/legging-1.jpg'], category: 'selene', subcategory: 'Calças', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#666666' }], description: 'Legging Selene básica sem costura. Modelagem clássica com cintura alta e compressão leve. Ideal para yoga e pilates.', specifications: ['Composição: 93% Poliamida, 7% Elastano', 'Sem costura', 'Cintura alta', 'Compressão leve'], rating: 4.6, reviewCount: 89, sku: 'SEL-LG-003',
  },
  {
    id: '64', name: 'Top Básico Alcinha Preto Essencial', price: 29.90, image: '/produtos/top-1.jpg', images: ['/produtos/top-1.jpg', '/produtos/top-2.jpg'], category: 'tops', subcategory: 'Tops & Croppeds', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Branco', hex: '#FFFFFF' }, { name: 'Cinza', hex: '#808080' }], description: 'Top básico alcinha, peça essencial para qualquer treino. Tecido leve, confortável e com ótimo custo-benefício.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Modelo alcinha', 'Custo-benefício', 'Básico'], rating: 4.3, reviewCount: 312, sku: 'LUF-TP-BAS-01',
  },
  {
    id: '65', name: 'Legging Fitness Cintura Alta Preta Básica', price: 59.90, oldPrice: 89.90, image: '/produtos/legging-1.jpg', images: ['/produtos/legging-1.jpg', '/produtos/legging-2.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['PP', 'P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Azul Marinho', hex: '#1a1a5e' }], description: 'Legging cintura alta básica, o melhor custo-benefício da LUFIT. Compressão média, tecido confortável e não transparente.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Cintura alta', 'Não transparente', 'Básico essencial'], rating: 4.5, reviewCount: 567, isSale: true, sku: 'LUF-LG-BAS-02',
  },
  {
    id: '66', name: 'Shorts Curto Running Preto com Bolso', price: 39.90, image: '/produtos/short-1.jpg', images: ['/produtos/short-1.jpg', '/produtos/short-2.jpg'], category: 'shorts', subcategory: 'Shorts & Bermudas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Shorts curto running com bolso lateral para celular. Ideal para corridas e treinos de alta intensidade.', specifications: ['Composição: 92% Poliamida, 8% Elastano', 'Bolso lateral', 'Leve', 'Secagem rápida'], rating: 4.4, reviewCount: 198, sku: 'LUF-SH-RUN-03',
  },
  {
    id: '67', name: 'Camiseta Oversized Feminina Cinza Mescla', price: 49.90, oldPrice: 69.90, image: '/produtos/blusa-2.jpg', images: ['/produtos/blusa-2.jpg', '/produtos/blusa-1.jpg'], category: 'blusas', subcategory: 'Blusas & Camisetas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Cinza Mescla', hex: '#9EA7B0' }, { name: 'Preto', hex: '#000000' }, { name: 'Branco', hex: '#FFFFFF' }], description: 'Camiseta oversized feminina, modelo soltinho e super confortável. Perfeita para o pós-treino ou uso casual.', specifications: ['Composição: 95% Algodão, 5% Elastano', 'Oversized', 'Confortável', 'Casual'], rating: 4.6, reviewCount: 245, isSale: true, sku: 'LUF-BL-OVE-04',
  },
  {
    id: '68', name: 'Conjunto Básico Top + Shorts Preto', price: 79.90, oldPrice: 109.90, image: '/produtos/conjunto-1.jpg', images: ['/produtos/conjunto-1.jpg', '/produtos/top-1.jpg', '/produtos/short-1.jpg'], category: 'conjuntos', subcategory: 'Conjuntos', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Rosa', hex: '#FF69B4' }, { name: 'Turquesa', hex: '#2DD4A8' }], description: 'Conjunto básico com top e shorts coordenados. Look completo pronto para o treino. Ótimo custo-benefício.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Look completo', 'Coordenado', 'Básico'], rating: 4.7, reviewCount: 423, isSale: true, sku: 'LUF-CJ-BAS-05',
  },
  {
    id: '69', name: 'Legging Premium Scrunch Butt Rosa Choque', price: 139.90, oldPrice: 189.90, image: '/produtos/legging-3.jpg', images: ['/produtos/legging-3.jpg', '/produtos/legging-4.jpg'], category: 'leggings', subcategory: 'Leggings', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Rosa Choque', hex: '#FF1493' }, { name: 'Preto', hex: '#000000' }, { name: 'Lilás', hex: '#C8A2C8' }], description: 'Legging premium com efeito scrunch que valoriza o bumbum. Tecido de alta compressão, sem transparência e com acabamento impecável.', specifications: ['Composição: 88% Poliamida, 12% Elastano', 'Efeito scrunch', 'Alta compressão', 'Premium'], rating: 4.9, reviewCount: 892, isSale: true, isNew: true, sku: 'LUF-LG-PRM-06',
  },
  {
    id: '70', name: 'Top Cruzado Costas Algodão Orgânico Verde', price: 54.90, image: '/produtos/top-4.jpg', images: ['/produtos/top-4.jpg', '/produtos/top-1.jpg'], category: 'tops', subcategory: 'Tops & Croppeds', sizes: ['P', 'M', 'G'], colors: [{ name: 'Verde Militar', hex: '#4B5320' }, { name: 'Preto', hex: '#000000' }, { name: 'Vinho', hex: '#722F37' }], description: 'Top com alças cruzadas nas costas em algodão orgânico. Sustentabilidade e estilo para seu treino.', specifications: ['Composição: 95% Algodão orgânico, 5% Elastano', 'Sustentável', 'Alças cruzadas', 'Confortável'], rating: 4.5, reviewCount: 156, isNew: true, sku: 'LUF-TP-ECO-07',
  },
  {
    id: '71', name: 'Bermuda Biker 3/4 Compressão Alta Preta', price: 69.90, oldPrice: 99.90, image: '/produtos/short-2.jpg', images: ['/produtos/short-2.jpg', '/produtos/short-1.jpg'], category: 'shorts', subcategory: 'Shorts & Bermudas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Bermuda biker 3/4 de alta compressão. Modelo que modela e valoriza a silhueta. Ideal para bike e musculação.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'Compressão alta', 'Modeladora', '3/4'], rating: 4.7, reviewCount: 334, isSale: true, sku: 'LUF-SH-BKR-08',
  },
  {
    id: '72', name: 'Jaqueta Corta-Vento Refletiva Preta', price: 149.90, oldPrice: 199.90, image: '/produtos/casaco-1.jpg', images: ['/produtos/casaco-1.jpg'], category: 'casacos', subcategory: 'Casacos & Jaquetas', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Prata', hex: '#C0C0C0' }], description: 'Jaqueta corta-vento com detalhes refletivos para corridas noturnas. Leve, dobrável e resistente à água.', specifications: ['Composição: 100% Poliéster', 'Refletiva', 'Resistente à água', 'Leve'], rating: 4.6, reviewCount: 89, isSale: true, sku: 'LUF-CA-CV-09',
  },
  {
    id: '73', name: 'Macaquinho Fitness All-in-One Preto', price: 119.90, oldPrice: 159.90, image: '/produtos/macacao-1.jpg', images: ['/produtos/macacao-1.jpg', '/produtos/legging-1.jpg'], category: 'macaquinhos', subcategory: 'Macaquinhos', sizes: ['P', 'M', 'G'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Macaquinho all-in-one, prático e estiloso. Modelo completo que elimina a preocupação de coordenar peças.', specifications: ['Composição: 90% Poliamida, 10% Elastano', 'All-in-one', 'Prático', 'Estiloso'], rating: 4.8, reviewCount: 178, isSale: true, sku: 'LUF-MQ-ALL-10',
  },
  {
    id: '74', name: 'Saída de Praia Longa Branca Transparente', price: 59.90, image: '/produtos/blusa-1.jpg', images: ['/produtos/blusa-1.jpg', '/produtos/top-3.jpg'], category: 'praia', subcategory: 'Moda Praia', sizes: ['P', 'M', 'G', 'GG'], colors: [{ name: 'Branco', hex: '#FFFFFF' }, { name: 'Preto', hex: '#000000' }], description: 'Saída de praia longa e leve, modelo transparente que combina com qualquer biquíni. Essencial para o verão.', specifications: ['Composição: 100% Viscose', 'Longa', 'Transparente', 'Leve'], rating: 4.4, reviewCount: 67, sku: 'LUF-MP-SAI-11',
  },
  {
    id: '75', name: 'Mochila Esportiva Impermeável Preta 25L', price: 199.90, oldPrice: 249.90, image: '/produtos/casaco-1.jpg', images: ['/produtos/casaco-1.jpg'], category: 'acessorios', subcategory: 'Acessórios', sizes: ['U'], colors: [{ name: 'Preto', hex: '#000000' }, { name: 'Cinza', hex: '#808080' }], description: 'Mochila esportiva impermeável 25 litros. Compartimento para notebook, bolso térmico e alças acolchoadas.', specifications: ['Capacidade: 25L', 'Impermeável', 'Compartimento notebook', 'Bolso térmico'], rating: 4.7, reviewCount: 203, isSale: true, sku: 'LUF-AC-MOC-12',
  },
];

export const banners = [
  { id: 1, image: '/banners/banner-1.jpg', title: 'ALTA PERFORMANCE', subtitle: 'Roupas de academia com tecnologia e estilo', cta: 'Ver Coleção', link: '/categoria/leggings' },
  { id: 2, image: '/banners/banner-2.jpg', title: 'POWER COLLECTION', subtitle: 'A nova coleção de moda fitness chegou', cta: 'Explorar', link: '/categoria/tops' },
  { id: 3, image: '/banners/banner-praia.jpg', title: 'MODA PRAIA 2026', subtitle: 'Do treino à praia, leve o seu estilo', cta: 'Conferir', link: '/categoria/praia' },
  { id: 4, image: '/banners/banner-4.jpg', title: 'FREEMOVE MASCULINO', subtitle: 'Performance sem limites para homens de atitude', cta: 'Ver Masculino', link: '/categoria/masculino' },
  { id: 5, image: '/banners/kids-new.jpg', title: 'KIDS', subtitle: 'Pequenos atletas, grandes conquistas', cta: 'Ver Infantil', link: '/categoria/infantil' },
];

export const destaques = [
  { id: 1, image: '/produtos/legging-3.jpg', title: 'MAIS VENDIDOS', subtitle: 'Os favoritos das nossas clientes', link: '/categoria/leggings' },
  { id: 2, image: '/produtos/conjunto-1.jpg', title: 'CONJUNTOS', subtitle: 'Look completo e coordenado', link: '/categoria/conjuntos' },
  { id: 3, image: '/produtos/top-1.jpg', title: 'NOVIDADES', subtitle: 'As últimas tendências fitness', link: '/categoria/tops' },
];

export const getProductById = (id: string): Product | undefined => products.find(p => p.id === id);
export const getProductsByCategory = (category: string): Product[] => products.filter(p => p.category === category);
export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  return products.filter(p => p.category === product.category && p.id !== productId).slice(0, limit);
};

// ===== INJECAO SUPABASE =====
// Tenta carregar produtos do Supabase, senao mantem mock
let supabaseLoaded = false

async function loadFromSupabase() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      'https://dgzgqblkcewqqfmqqzbs.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnemdxYmxrY2V3cXFmbXFxemJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDY3MjMsImV4cCI6MjA5NDYyMjcyM30.aLbqJk7dG_lLJPFo5U5eEb9dKYkUHXCxFLBTbKnFDNo'
    )

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)

    if (error || !data || data.length === 0) {
      console.log('[Products] Supabase vazio ou erro, usando mock local')
      return
    }

    const mapped: Product[] = data.map((row: any) => ({
      id: row.legacy_id || row.id,
      name: row.name,
      price: Number(row.price) || 0,
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
    }))

    // Substituir array de produtos
    ;(products as Product[]).splice(0, products.length, ...mapped)
    supabaseLoaded = true
    console.log(`[Products] ${mapped.length} produtos carregados do Supabase!`)
  } catch (err: any) {
    console.log('[Products] Usando mock local (Supabase nao disponivel)')
  }
}

// Iniciar carregamento assincrono
loadFromSupabase()
export { supabaseLoaded }
// ===== FIM INJECAO SUPABASE =====
