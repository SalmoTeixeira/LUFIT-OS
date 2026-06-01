/**
 * Script de Seed - LUFIT OS Homologacao
 * Le products.ts e gera SQL para injetar no Supabase
 * 
 * Executar: node scripts/seed_database.cjs
 * Saida:   scripts/seed_output.sql (copiar para SQL Editor do Supabase)
 */

const fs = require('fs');
const path = require('path');

// Ler o arquivo products.ts
const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.ts');
const productsContent = fs.readFileSync(productsPath, 'utf8');

// Extrair os produtos usando regex
const productMatches = productsContent.matchAll(
  /\{\s*id:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'\s*,\s*price:\s*([0-9.]+)(?:\s*,\s*oldPrice:\s*([0-9.]+))?\s*,\s*image:\s*'([^']+)'\s*,\s*images:\s*(\[[^\]]*\])\s*,\s*category:\s*'([^']+)'\s*,\s*subcategory:\s*'([^']+)'\s*,\s*sizes:\s*(\[[^\]]*\])\s*,\s*colors:\s*(\[[^\]]*\])\s*,\s*description:\s*'([^']*)'\s*,\s*specifications:\s*(\[[^\]]*\])\s*,\s*rating:\s*([0-9.]+)\s*,\s*reviewCount:\s*(\d+)(?:\s*,\s*isNew:\s*(true|false))?(?:\s*,\s*isSale:\s*(true|false))?\s*,\s*sku:\s*'([^']+)'/gs
);

// Metodo alternativo: parse manual dos produtos
function parseProducts(content) {
  const products = [];
  // Encontrar todos os blocos de produto
  const regex = /id:\s*'([^']+)'[\s\S]*?sku:\s*'([^']+)'/g;
  let match;
  
  // Vamos extrair campo por campo
  const productBlocks = content.split('// ').flatMap(block => {
    // Split por objetos que começam com { id:
    const objs = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < block.length; i++) {
      const ch = block[i];
      const prev = block[i-1];
      
      if (inString) {
        if (ch === stringChar && prev !== '\\') inString = false;
        continue;
      }
      
      if (ch === "'" || ch === '"') {
        inString = true;
        stringChar = ch;
        continue;
      }
      
      if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          objs.push(block.substring(start, i + 1));
          start = -1;
        }
      }
    }
    return objs;
  });
  
  return productBlocks.filter(obj => obj.includes("id:") && obj.includes("sku:"));
}

function extractField(block, fieldName) {
  // Tenta extrair: fieldName: 'valor' ou fieldName: valor
  const strMatch = block.match(new RegExp(`${fieldName}:\\s*'([^']*)'`));
  if (strMatch) return strMatch[1];
  
  const numMatch = block.match(new RegExp(`${fieldName}:\\s*([0-9.]+)`));
  if (numMatch) return numMatch[1];
  
  return null;
}

function extractArray(block, fieldName) {
  // Encontra o array completo
  const regex = new RegExp(`${fieldName}:\\s*\\[([\\s\\S]*?)\\]`);
  const match = block.match(regex);
  if (!match) return [];
  
  const arrContent = match[1];
  // Extrair strings do array
  const items = [];
  const strMatches = arrContent.matchAll(/'([^']*)'/g);
  for (const m of strMatches) {
    items.push(m[1]);
  }
  return items;
}

function extractColors(block) {
  const regex = /colors:\s*\[([\s\S]*?)\]/;
  const match = block.match(regex);
  if (!match) return [];
  
  const colors = [];
  const colorMatches = match[1].matchAll(/\{\s*name:\s*'([^']+)'\s*,\s*hex:\s*'([^']+)'\s*\}/g);
  for (const m of colorMatches) {
    colors.push({ name: m[1], hex: m[2] });
  }
  return colors;
}

// Parse todos os produtos
const blocks = parseProducts(productsContent);
console.log(`Encontrados ${blocks.length} blocos de produto`);

const products = blocks.map((block, idx) => {
  const id = extractField(block, 'id');
  const name = extractField(block, 'name');
  const price = parseFloat(extractField(block, 'price') || '0');
  const oldPriceStr = block.match(/oldPrice:\s*([0-9.]+)/);
  const oldPrice = oldPriceStr ? parseFloat(oldPriceStr[1]) : null;
  const image = extractField(block, 'image');
  const category = extractField(block, 'category');
  const subcategory = extractField(block, 'subcategory');
  const sizes = extractArray(block, 'sizes');
  const colors = extractColors(block);
  const description = extractField(block, 'description');
  const specs = extractArray(block, 'specifications');
  const rating = parseFloat(extractField(block, 'rating') || '0');
  const reviewCount = parseInt(extractField(block, 'reviewCount') || '0');
  const sku = extractField(block, 'sku');
  const isNew = block.includes('isNew: true');
  const isSale = block.includes('isSale: true');
  
  return {
    id, name, price, oldPrice, image, category, subcategory,
    sizes, colors, description, specifications: specs, rating, reviewCount, sku, isNew, isSale
  };
}).filter(p => p.id && p.name); // Filtrar apenas produtos validos

console.log(`Produtos parseados com sucesso: ${products.length}`);

// ===== GERAR SQL =====
let sql = `-- ============================================
-- LUFIT OS - SEED DE HOMOLOGACAO
-- Execute no SQL Editor do Supabase
-- Data: ${new Date().toISOString()}
-- ============================================

BEGIN;

-- 1. Criar tabela suppliers (fornecedores) se nao existir
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    cnpj TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    contact_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela products se nao existir
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT,
    description TEXT,
    specifications JSONB DEFAULT '[]'::jsonb,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    old_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    category TEXT,
    subcategory TEXT,
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    sizes JSONB DEFAULT '[]'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    rating DECIMAL(3,1) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    is_sale BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    supplier_id UUID REFERENCES suppliers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela inventory (estoque) se nao existir
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    location TEXT,
    last_movement TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id)
);

-- 4. Criar fornecedor de teste
INSERT INTO suppliers (name, code, cnpj, phone, email, address, city, state, contact_name, is_active)
VALUES (
    'FORNECEDOR TESTE LUFIT 01',
    'FNT-TEST-001',
    '00.000.000/0000-00',
    '(62) 99394-0034',
    'fornecedor.teste@lufit.com.br',
    'Av. Goiania, Qd. 73 - Lt 10',
    'Goiania',
    'GO',
    'Fornecedor Teste',
    true
)
ON CONFLICT (code) DO NOTHING;

-- Pegar o ID do fornecedor
DO $$ 
DECLARE
    v_supplier_id UUID;
BEGIN
    SELECT id INTO v_supplier_id FROM suppliers WHERE code = 'FNT-TEST-001';

    -- 5. Inserir produtos
`;

// Inserir cada produto
products.forEach((p, idx) => {
  const costPrice = (p.price * 0.5).toFixed(2);
  const safeName = p.name.replace(/'/g, "''");
  const safeDesc = (p.description || '').replace(/'/g, "''");
  const safeSku = p.sku ? p.sku.replace(/'/g, "''") : `LUF-${p.id}`;
  const safeImage = (p.image || '').replace(/'/g, "''");
  const safeCategory = (p.category || '').replace(/'/g, "''");
  const safeSubcategory = (p.subcategory || '').replace(/'/g, "''");
  const sizesJson = JSON.stringify(p.sizes || []);
  const colorsJson = JSON.stringify(p.colors || []);
  const specsJson = JSON.stringify(p.specifications || []);
  const imagesJson = JSON.stringify([p.image]);
  
  sql += `
    -- Produto ${idx + 1}: ${safeName}
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '${p.id}', '${safeName}', '${safeSku}', '${safeDesc}', '${specsJson}',
        ${p.price}, ${p.oldPrice || 'NULL'}, ${costPrice},
        '${safeCategory}', '${safeSubcategory}', '${safeImage}', '${imagesJson}', '${sizesJson}', '${colorsJson}',
        ${p.rating}, ${p.reviewCount}, ${p.isNew}, ${p.isSale}, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();
`;
});

sql += `
    -- 6. Criar estoque (50 unidades para cada produto)
    INSERT INTO inventory (product_id, quantity, min_stock)
    SELECT id, 50, 5 FROM products WHERE supplier_id = v_supplier_id
    ON CONFLICT (product_id) DO UPDATE SET
        quantity = 50,
        updated_at = NOW();

END $$;

COMMIT;

-- Verificacao
SELECT 'Fornecedores:' as info, COUNT(*) as total FROM suppliers
UNION ALL
SELECT 'Produtos injetados:', COUNT(*) FROM products
UNION ALL
SELECT 'Itens em estoque:', COUNT(*) FROM inventory WHERE quantity = 50;
`;

// Salvar SQL
const outputPath = path.join(__dirname, 'seed_output.sql');
fs.writeFileSync(outputPath, sql);

console.log(`✅ SQL gerado com sucesso!`);
console.log(`📁 Arquivo: ${outputPath}`);
console.log(`📊 Produtos: ${products.length}`);
console.log(`💰 Todos com cost_price = 50% do preco de venda`);
console.log(`📦 Estoque: 50 unidades cada`);
console.log(`🏭 Fornecedor: FORNECEDOR TESTE LUFIT 01`);
console.log('');
console.log('INSTRUCOES:');
console.log('1. Acesse: https://supabase.com/dashboard/project/dgzgqblkcewqqfmqqzbs');
console.log('2. Va em SQL Editor');
console.log('3. Cole o conteudo de seed_output.sql');
console.log('4. Clique em RUN');
