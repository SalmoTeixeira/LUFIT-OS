-- ============================================
-- LUFIT OS - SEED DE HOMOLOGACAO
-- Execute no SQL Editor do Supabase
-- Data: 2026-05-31T19:35:38.438Z
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

    -- Produto 1: Calça Legging Energy Poliamida Preta com Elástico Colorido
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '1', 'Calça Legging Energy Poliamida Preta com Elástico Colorido', 'LUF-LG-001', 'A Legging Energy é confeccionada em poliamida de alta compressão, proporcionando sustentação e conforto durante os treinos. Modelagem com cós alto que valoriza a silhueta.', '["Composição: 90% Poliamida, 10% Elastano","Compressive Fit","Cós alto duplo","Não transparente","Secagem rápida"]',
        90.99, 139.99, 45.49,
        'leggings', 'Leggings', '/produtos/legging-1.jpg', '["/produtos/legging-1.jpg"]', '["PP","P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Azul Marinho","hex":"#1a1a5e"}]',
        4.8, 124, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 2: Legging Azul Marinho com Faixa Lateral Branca
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '2', 'Legging Azul Marinho com Faixa Lateral Branca', 'LUF-LG-007', 'Legging com faixa lateral branca que alonga a silhueta. Modelo clássico e elegante para qualquer modalidade.', '["Composição: 88% Poliamida, 12% Elastano","Faixa lateral","Cós alto","Modelagem clássica"]',
        99.9, 129.9, 49.95,
        'leggings', 'Leggings', '/produtos/legging-2.jpg', '["/produtos/legging-2.jpg"]', '["PP","P","M","G","GG"]', '[{"name":"Azul Marinho","hex":"#1a1a5e"},{"name":"Preto","hex":"#000000"}]',
        4.6, 78, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 3: Legging Turquesa Scrunch Butt
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '3', 'Legging Turquesa Scrunch Butt', 'LUF-LG-010', 'Legging com efeito scrunch no bumbum que valoriza e levanta. Modelo mais vendido da coleção.', '["Composição: 88% Poliamida, 12% Elastano","Efeito scrunch","Cós alto","Alta compressão"]',
        109.9, NULL, 54.95,
        'leggings', 'Leggings', '/produtos/legging-3.jpg', '["/produtos/legging-3.jpg"]', '["P","M","G","GG"]', '[{"name":"Turquesa","hex":"#2DD4A8"},{"name":"Rosa","hex":"#FF69B4"},{"name":"Preto","hex":"#000000"}]',
        4.9, 215, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 4: Legging Lilás com Bolso Lateral
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '4', 'Legging Lilás com Bolso Lateral', 'LUF-LG-014', 'Legging lilás com bolso lateral para celular. Modelo prático e confortável.', '["Composição: 88% Poliamida, 12% Elastano","Bolso lateral","Cós alto","Alta compressão"]',
        119.9, NULL, 59.95,
        'leggings', 'Leggings', '/produtos/legging-4.jpg', '["/produtos/legging-4.jpg"]', '["P","M","G"]', '[{"name":"Lilás","hex":"#C8A2C8"},{"name":"Preto","hex":"#000000"}]',
        4.6, 48, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 5: Legging Cintura Alta Preta Sem Costura
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '5', 'Legging Cintura Alta Preta Sem Costura', 'LUF-LG-020', 'Legging cintura alta sem costura. Modelo premium com acabamento impecável.', '["Composição: 94% Poliamida, 6% Elastano","Sem costura","Cintura alta","Premium"]',
        99.9, 139.9, 49.95,
        'leggings', 'Leggings', '/produtos/legging-1.jpg', '["/produtos/legging-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza Chumbo","hex":"#36454F"}]',
        4.8, 167, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 6: Legging Vermelha Power Compression
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '6', 'Legging Vermelha Power Compression', 'LUF-LG-021', 'Legging vermelha de alta compressão com tecnologia anti odor. Ideal para treinos intensos.', '["Composição: 88% Poliamida, 12% Elastano","Anti odor","Alta compressão","Cós alto"]',
        129.9, 169.9, 64.95,
        'leggings', 'Leggings', '/produtos/legging-5.jpg', '["/produtos/legging-5.jpg"]', '["P","M","G","GG"]', '[{"name":"Vermelho","hex":"#E53935"},{"name":"Preto","hex":"#000000"}]',
        4.7, 92, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 7: Legging Bootcut Evasê Preta
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '7', 'Legging Bootcut Evasê Preta', 'LUF-LG-022', 'Legging modelo bootcut com corte evasê na barra. Versátil para treino e uso casual.', '["Composição: 90% Poliamida, 10% Elastano","Modelo bootcut","Cós alto","Versátil"]',
        119.9, NULL, 59.95,
        'leggings', 'Leggings', '/produtos/legging-2.jpg', '["/produtos/legging-2.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.5, 34, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 8: Legging Cós Transparente Preto
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '8', 'Legging Cós Transparente Preto', 'LUF-LG-023', 'Legging com detalhe de tule transparente no cós. Modelo estiloso e diferenciado.', '["Composição: 90% Poliamida, 10% Elastano","Detalhe em tule","Cós diferenciado","Não transparente"]',
        109.9, 149.9, 54.95,
        'leggings', 'Leggings', '/produtos/legging-3.jpg', '["/produtos/legging-3.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"}]',
        4.6, 56, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 9: Top Fitness Feminino com Recortes Preto Básico
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '9', 'Top Fitness Feminino com Recortes Preto Básico', 'LUF-TP-002', 'Top fitness com recortes estratégicos que proporcionam respirabilidade e estilo. Possui bojo removível.', '["Composição: 88% Poliamida, 12% Elastano","Bojo removível","Alças reguláveis","Média sustentação"]',
        59.9, 79.9, 29.95,
        'tops', 'Tops & Croppeds', '/produtos/top-1.jpg', '["/produtos/top-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Turquesa","hex":"#2DD4A8"},{"name":"Preto","hex":"#000000"},{"name":"Rosa","hex":"#FF69B4"}]',
        4.7, 89, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 10: Top Cropped Rosa com Tule nas Costas
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '10', 'Top Cropped Rosa com Tule nas Costas', 'LUF-TP-008', 'Top cropped com detalhe em tule nas costas. Modelo estiloso que combina funcionalidade e beleza.', '["Composição: 90% Poliamida, 10% Elastano","Tule nas costas","Bojo removível","Alta sustentação"]',
        69.9, NULL, 34.95,
        'tops', 'Tops & Croppeds', '/produtos/top-2.jpg', '["/produtos/top-2.jpg"]', '["P","M","G"]', '[{"name":"Rosa","hex":"#FF69B4"},{"name":"Preto","hex":"#000000"},{"name":"Vinho","hex":"#722F37"}]',
        4.8, 52, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 11: Top Neon Verde Cruzado nas Costas
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '11', 'Top Neon Verde Cruzado nas Costas', 'LUF-TP-009', 'Top esportivo neon com alças cruzadas nas costas. Alta sustentação para treinos de impacto.', '["Composição: 90% Poliamida, 10% Elastano","Alças cruzadas","Alta sustentação","Tecido neon"]',
        74.9, 99.9, 37.45,
        'tops', 'Tops & Croppeds', '/produtos/top-4.jpg', '["/produtos/top-4.jpg"]', '["P","M","G","GG"]', '[{"name":"Neon Verde","hex":"#7FFF00"},{"name":"Preto","hex":"#000000"}]',
        4.6, 43, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 12: Top Longline com Mesh Preto
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '12', 'Top Longline com Mesh Preto', 'LUF-TP-010', 'Top longline com recortes em mesh transpirável. Modelo moderno e super confortável.', '["Composição: 88% Poliamida, 12% Elastano","Recortes em mesh","Longline","Bojo removível"]',
        79.9, NULL, 39.95,
        'tops', 'Tops & Croppeds', '/produtos/top-5.jpg', '["/produtos/top-5.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Branco","hex":"#FFFFFF"}]',
        4.7, 67, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 13: Top Sports Branco com Detalhe em Tule
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '13', 'Top Sports Branco com Detalhe em Tule', 'LUF-MP-019', 'Top esportivo branco com detalhes em tule. Perfeito para treinos e praia.', '["Composição: 88% Poliamida, 12% Elastano","Detalhes em tule","Versátil","Bojo removível"]',
        74.9, NULL, 37.45,
        'praia', 'Moda Praia', '/produtos/top-3.jpg', '["/produtos/top-3.jpg"]', '["P","M","G"]', '[{"name":"Branco","hex":"#FFFFFF"},{"name":"Preto","hex":"#000000"}]',
        4.6, 45, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 14: Cropped Básico Dry Fit Preto
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '14', 'Cropped Básico Dry Fit Preto', 'LUF-TP-011', 'Cropped básico dry fit, essencial para qualquer treino. Tecido leve e de secagem rápida.', '["Composição: 100% Poliéster","Tecnologia Dry Fit","Leve","Secagem rápida"]',
        49.9, 69.9, 24.95,
        'tops', 'Tops & Croppeds', '/produtos/top-1.jpg', '["/produtos/top-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Branco","hex":"#FFFFFF"},{"name":"Cinza","hex":"#808080"}]',
        4.4, 112, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 15: Top Tomara Que Caia com Bojo
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '15', 'Top Tomara Que Caia com Bojo', 'LUF-TP-012', 'Top modelo tomara que caia com bojo fixo. Ideal para yoga e pilates.', '["Composição: 90% Poliamida, 10% Elastano","Bojo fixo","Modelo strapless","Confortável"]',
        64.9, NULL, 32.45,
        'tops', 'Tops & Croppeds', '/produtos/top-2.jpg', '["/produtos/top-2.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Nude","hex":"#F5C6A5"}]',
        4.5, 38, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 16: Top Nadador Preto com Bojo Fixo
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '16', 'Top Nadador Preto com Bojo Fixo', 'LUF-TP-024', 'Top modelo nadador com bojo fixo. Excelente sustentação para treinos intensos.', '["Composição: 90% Poliamida, 10% Elastano","Bojo fixo","Alta sustentação","Modelo nadador"]',
        59.9, 79.9, 29.95,
        'tops', 'Tops & Croppeds', '/produtos/top-1.jpg', '["/produtos/top-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Vermelho","hex":"#E53935"}]',
        4.5, 82, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 17: Conjunto Fitness Estampado Preto e Cinza
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '17', 'Conjunto Fitness Estampado Preto e Cinza', 'LUF-CJ-003', 'Conjunto fitness completo com top e shorts estampados. Tecido de alta compressão com estampa exclusiva LUFIT.', '["Composição: 85% Poliamida, 15% Elastano","Estampa exclusiva","Alta compressão","Shorts com bolso lateral"]',
        149.9, 199.9, 74.95,
        'conjuntos', 'Conjuntos', '/produtos/conjunto-1.jpg', '["/produtos/conjunto-1.jpg"]', '["P","M","G"]', '[{"name":"Estampado","hex":"#333333"}]',
        4.9, 67, true, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 18: Conjunto Turquesa Top e Legging
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '18', 'Conjunto Turquesa Top e Legging', 'LUF-CJ-015', 'Conjunto completo top e legging na cor turquesa. Look completo para seu treino.', '["Composição: 90% Poliamida, 10% Elastano","Look completo","Alta compressão","Bojo removível"]',
        179.9, 229.9, 89.95,
        'conjuntos', 'Conjuntos', '/produtos/legging-3.jpg', '["/produtos/legging-3.jpg"]', '["P","M","G"]', '[{"name":"Turquesa","hex":"#2DD4A8"},{"name":"Preto","hex":"#000000"},{"name":"Rosa","hex":"#FF69B4"}]',
        4.8, 89, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 19: Conjunto Preto e Cinza com Top e Short
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '19', 'Conjunto Preto e Cinza com Top e Short', 'LUF-CJ-022', 'Conjunto com top e short estampado preto e cinza. Look completo e coordenado.', '["Composição: 90% Poliamida, 10% Elastano","Estampado","Look completo","Confortável"]',
        139.9, NULL, 69.95,
        'conjuntos', 'Conjuntos', '/produtos/conjunto-1.jpg', '["/produtos/conjunto-1.jpg"]', '["P","M","G"]', '[{"name":"Preto/Cinza","hex":"#333333"}]',
        4.6, 55, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 20: Conjunto Fit Rosa Calça e Top
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '20', 'Conjunto Fit Rosa Calça e Top', 'LUF-CJ-025', 'Conjunto fit na cor rosa com legging e top coordenados. Look feminino e poderoso.', '["Composição: 88% Poliamida, 12% Elastano","Look coordenado","Alta compressão","Modelagem fit"]',
        159.9, 209.9, 79.95,
        'conjuntos', 'Conjuntos', '/produtos/legging-4.jpg', '["/produtos/legging-4.jpg"]', '["P","M","G"]', '[{"name":"Rosa","hex":"#FF69B4"},{"name":"Preto","hex":"#000000"}]',
        4.7, 71, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 21: Conjunto Basic Preto Top e Bermuda
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '21', 'Conjunto Basic Preto Top e Bermuda', 'LUF-CJ-026', 'Conjunto básico preto com top e bermuda biker. Essencial para qualquer guarda-roupa fitness.', '["Composição: 90% Poliamida, 10% Elastano","Look básico","Versátil","Confortável"]',
        129.9, NULL, 64.95,
        'conjuntos', 'Conjuntos', '/produtos/top-5.jpg', '["/produtos/top-5.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Branco","hex":"#FFFFFF"}]',
        4.5, 93, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 22: Bermuda Biker Coral Alta Compressão
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '22', 'Bermuda Biker Coral Alta Compressão', 'LUF-SH-004', 'Bermuda biker de alta compressão, modelo ideal para treinos intensos. Cós alto que modela a cintura.', '["Composição: 90% Poliamida, 10% Elastano","Alta compressão","Cós alto","Não marca"]',
        79.9, NULL, 39.95,
        'shorts', 'Shorts & Bermudas', '/produtos/short-1.jpg', '["/produtos/short-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Coral","hex":"#FF7F50"},{"name":"Preto","hex":"#000000"},{"name":"Turquesa","hex":"#2DD4A8"}]',
        4.6, 93, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 23: Bermuda Biker Estampada Preto e Branco
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '23', 'Bermuda Biker Estampada Preto e Branco', 'LUF-SH-011', 'Bermuda biker com estampa geométrica preto e branco. Modelo estiloso para treinos.', '["Composição: 90% Poliamida, 10% Elastano","Estampa geométrica","Cós alto","Bolso lateral"]',
        84.9, 99.9, 42.45,
        'shorts', 'Shorts & Bermudas', '/produtos/short-2.jpg', '["/produtos/short-2.jpg"]', '["P","M","G"]', '[{"name":"Estampada","hex":"#333333"}]',
        4.5, 43, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 24: Short Saia Fitness Preto com Short Interno
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '24', 'Short Saia Fitness Preto com Short Interno', 'LUF-SH-016', 'Short saia com short interno de compressão. Modelo versátil para treino ou uso casual.', '["Composição: 88% Poliamida, 12% Elastano","Short interno","Modelo saia","Versátil"]',
        79.9, NULL, 39.95,
        'shorts', 'Shorts & Bermudas', '/produtos/short-1.jpg', '["/produtos/short-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.5, 62, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 25: Bermuda Running Preta com Refletivo
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '25', 'Bermuda Running Preta com Refletivo', 'LUF-SH-023', 'Bermuda running com detalhes refletivos. Ideal para corridas noturnas.', '["Composição: 88% Poliamida, 12% Elastano","Detalhes refletivos","Leve","Ideal para corrida"]',
        69.9, NULL, 34.95,
        'shorts', 'Shorts & Bermudas', '/produtos/short-2.jpg', '["/produtos/short-2.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.4, 29, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 26: Shorts Comfort Azul Marinho
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '26', 'Shorts Comfort Azul Marinho', 'LUF-SH-027', 'Shorts comfort com cós largo e modelagem solta. Conforto máximo para treinos leves.', '["Composição: 92% Poliamida, 8% Elastano","Cós largo","Modelo comfort","Leve"]',
        64.9, 84.9, 32.45,
        'shorts', 'Shorts & Bermudas', '/produtos/short-1.jpg', '["/produtos/short-1.jpg"]', '["P","M","G"]', '[{"name":"Azul Marinho","hex":"#1a1a5e"},{"name":"Preto","hex":"#000000"}]',
        4.3, 41, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 27: Regata Fitness Nadador Preto
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '27', 'Regata Fitness Nadador Preto', 'LUF-BL-005', 'Regata com recorte nadador nas costas, modelo leve e respirável. Perfeita para treinos de alta intensidade.', '["Composição: 92% Poliamida, 8% Elastano","Modelo nadador","Tecido leve","Secagem ultra rápida"]',
        49.9, NULL, 24.95,
        'blusas', 'Blusas & Camisetas', '/produtos/blusa-1.jpg', '["/produtos/blusa-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Branco","hex":"#FFFFFF"},{"name":"Cinza","hex":"#808080"}]',
        4.5, 56, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 28: Cropped Manga Longa Sem Costura Cinza
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '28', 'Cropped Manga Longa Sem Costura Cinza', 'LUF-BL-006', 'Cropped manga longa sem costura, modelo que se adapta perfeitamente ao corpo. Tecido macio.', '["Composição: 94% Poliamida, 6% Elastano","Sem costura","Cropped","Manga longa"]',
        89.9, NULL, 44.95,
        'blusas', 'Blusas & Camisetas', '/produtos/blusa-2.jpg', '["/produtos/blusa-2.jpg"]', '["P","M","G"]', '[{"name":"Cinza","hex":"#808080"},{"name":"Preto","hex":"#000000"},{"name":"Bege","hex":"#F5F5DC"}]',
        4.7, 41, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 29: Blusa Térmica Manga Longa Cinza Mescla
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '29', 'Blusa Térmica Manga Longa Cinza Mescla', 'LUF-BL-021', 'Blusa térmica manga longa, ideal para treinos em dias frios ou como segunda pele.', '["Composição: 92% Poliamida, 8% Elastano","Térmica","Manga longa","Segunda pele"]',
        99.9, NULL, 49.95,
        'blusas', 'Blusas & Camisetas', '/produtos/blusa-2.jpg', '["/produtos/blusa-2.jpg"]', '["P","M","G","GG"]', '[{"name":"Cinza Mescla","hex":"#9EA7B0"},{"name":"Preto","hex":"#000000"}]',
        4.5, 33, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 30: Blusa Dry Fit Manga Curta Preta
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '30', 'Blusa Dry Fit Manga Curta Preta', 'LUF-BL-017', 'Blusa dry fit manga curta, modelo básico e essencial para qualquer atleta.', '["Composição: 100% Poliéster","Tecnologia Dry Fit","Manga curta","Anti odor"]',
        54.9, NULL, 27.45,
        'blusas', 'Blusas & Camisetas', '/produtos/blusa-1.jpg', '["/produtos/blusa-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Branco","hex":"#FFFFFF"},{"name":"Rosa","hex":"#FF69B4"}]',
        4.3, 105, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 31: Camiseta Oversized Fitness Branca
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '31', 'Camiseta Oversized Fitness Branca', 'LUF-BL-028', 'Camiseta oversized fitness, modelo solto e confortável. Perfeita para o pós-treino.', '["Composição: 95% Algodão, 5% Elastano","Modelo oversized","Confortável","Casual"]',
        69.9, 89.9, 34.95,
        'blusas', 'Blusas & Camisetas', '/produtos/blusa-2.jpg', '["/produtos/blusa-2.jpg"]', '["P","M","G","GG"]', '[{"name":"Branco","hex":"#FFFFFF"},{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.4, 78, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 32: Macacão Longo Preto com Zíper Frontal
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '32', 'Macacão Longo Preto com Zíper Frontal', 'LUF-MC-009', 'Macacão longo com zíper frontal e gola alta. Modelo sofisticado que valoriza a silhueta.', '["Composição: 85% Poliamida, 15% Elastano","Zíper frontal","Gola alta","Modelagem contorno"]',
        189.9, 249.9, 94.95,
        'macacoes', 'Macacões', '/produtos/macacao-1.jpg', '["/produtos/macacao-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"}]',
        4.9, 34, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 33: Macaquinho Fitness Preto com Recortes
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '33', 'Macaquinho Fitness Preto com Recortes', 'LUF-MQ-018', 'Macaquinho fitness com recortes estratégicos. Modelo all-in-one prático e estiloso.', '["Composição: 90% Poliamida, 10% Elastano","Modelo all-in-one","Recortes estratégicos","Cós alto"]',
        129.9, 169.9, 64.95,
        'macaquinhos', 'Macaquinhos', '/produtos/conjunto-1.jpg', '["/produtos/conjunto-1.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.7, 38, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 34: Macacão Curto Open Back Verde
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '34', 'Macacão Curto Open Back Verde', 'LUF-MC-029', 'Macacão curto com decote nas costas. Modelo elegante para treinos ou saídas casuais.', '["Composição: 88% Poliamida, 12% Elastano","Decote nas costas","Macaquinho curto","Elegante"]',
        149.9, NULL, 74.95,
        'macacoes', 'Macacões', '/produtos/macacao-1.jpg', '["/produtos/macacao-1.jpg"]', '["P","M","G"]', '[{"name":"Verde","hex":"#2DD4A8"},{"name":"Preto","hex":"#000000"}]',
        4.6, 52, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 35: Macaquinho Kids Estampado Infantil
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '35', 'Macaquinho Kids Estampado Infantil', 'LUF-MQ-030', 'Macaquinho infantil estampado. Confortável e resistente para as brincadeiras.', '["Composição: 92% Algodão, 8% Elastano","Infantil","Resistente","Confortável"]',
        89.9, NULL, 44.95,
        'macaquinhos', 'Macaquinhos', '/produtos/inf-2.jpg', '["/produtos/inf-2.jpg"]', '["P","M","G"]', '[{"name":"Estampado","hex":"#333333"}]',
        4.7, 24, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 36: Jaqueta Corta-Vento Preta com Capuz
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '36', 'Jaqueta Corta-Vento Preta com Capuz', 'LUF-CA-013', 'Jaqueta corta-vento com capuz e bolsos frontais. Ideal para aquecimento antes dos treinos.', '["Composição: 100% Poliéster","Capuz removível","Bolsos frontais","Corta-vento"]',
        159.9, NULL, 79.95,
        'casacos', 'Casacos & Jaquetas', '/produtos/casaco-1.jpg', '["/produtos/casaco-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.4, 28, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 37: Blusão Moletom Oversized Cinza
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '37', 'Blusão Moletom Oversized Cinza', 'LUF-CA-031', 'Blusão de moletom oversized, quentinho e super confortável. Ideal para o inverno.', '["Composição: 80% Algodão, 20% Poliéster","Moletom","Oversized","Quentinho"]',
        139.9, 179.9, 69.95,
        'casacos', 'Casacos & Jaquetas', '/produtos/blusa-2.jpg', '["/produtos/blusa-2.jpg"]', '["P","M","G","GG"]', '[{"name":"Cinza","hex":"#808080"},{"name":"Preto","hex":"#000000"},{"name":"Rosa","hex":"#FF69B4"}]',
        4.8, 86, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 38: Colete Aquecedor Preto Fitness
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '38', 'Colete Aquecedor Preto Fitness', 'LUF-CA-032', 'Colete aquecedor leve, perfeito para caminhadas e treinos ao ar livre.', '["Composição: 100% Poliéster","Leve","Aquecedor","Para outdoor"]',
        99.9, NULL, 49.95,
        'casacos', 'Casacos & Jaquetas', '/produtos/casaco-1.jpg', '["/produtos/casaco-1.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Branco","hex":"#FFFFFF"}]',
        4.3, 19, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 39: Regata Masculina Dry Fit Preta
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '39', 'Regata Masculina Dry Fit Preta', 'LUF-MS-001', 'Regata masculina dry fit, modelo leve e respirável para treinos intensos. Tecnologia anti odor.', '["Composição: 100% Poliéster","Tecnologia Dry Fit","Anti odor","Secagem rápida"]',
        59.9, 79.9, 29.95,
        'masculino', 'Masculino', '/produtos/masc-1.jpg', '["/produtos/masc-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"},{"name":"Branco","hex":"#FFFFFF"}]',
        4.6, 72, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 40: Bermuda Masculina Training Azul Marinho
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '40', 'Bermuda Masculina Training Azul Marinho', 'LUF-MS-002', 'Bermuda masculina de treino com bolso lateral e cós com elástico interno. Confortável.', '["Composição: 88% Poliamida, 12% Elastano","Bolso lateral","Cós com elástico","Secagem rápida"]',
        79.9, NULL, 39.95,
        'masculino', 'Masculino', '/produtos/masc-2.jpg', '["/produtos/masc-2.jpg"]', '["P","M","G","GG"]', '[{"name":"Azul Marinho","hex":"#1a1a5e"},{"name":"Preto","hex":"#000000"}]',
        4.5, 45, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 41: Camiseta Masculina Compressão Cinza
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '41', 'Camiseta Masculina Compressão Cinza', 'LUF-MS-003', 'Camiseta masculina de compressão, modelagem que valoriza a musculatura. Alta performance.', '["Composição: 90% Poliamida, 10% Elastano","Compressão leve","Modelagem fit","Anti odor"]',
        89.9, 109.9, 44.95,
        'masculino', 'Masculino', '/produtos/masc-3.jpg', '["/produtos/masc-3.jpg"]', '["P","M","G"]', '[{"name":"Cinza","hex":"#808080"},{"name":"Preto","hex":"#000000"}]',
        4.7, 58, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 42: Calça Masculina Compressão Térmica Preta
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '42', 'Calça Masculina Compressão Térmica Preta', 'LUF-MS-033', 'Calça masculina de compressão térmica, ideal para treinos em dias frios.', '["Composição: 85% Poliamida, 15% Elastano","Compressão","Térmica","Secagem rápida"]',
        119.9, NULL, 59.95,
        'masculino', 'Masculino', '/produtos/masc-4.jpg', '["/produtos/masc-4.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.6, 39, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 43: Moletom Masculino com Capuz Preto
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '43', 'Moletom Masculino com Capuz Preto', 'LUF-MS-034', 'Moletom masculino com capuz e bolsos frontais. Quentinho e estiloso para o inverno.', '["Composição: 80% Algodão, 20% Poliéster","Capuz","Bolsos frontais","Quentinho"]',
        149.9, 199.9, 74.95,
        'masculino', 'Masculino', '/produtos/masc-1.jpg', '["/produtos/masc-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"},{"name":"Azul","hex":"#1a1a5e"}]',
        4.7, 64, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 44: Camiseta Polo Fitness Masculina Azul
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '44', 'Camiseta Polo Fitness Masculina Azul', 'LUF-MS-035', 'Camiseta polo fitness masculina com gola e botões. Estilo casual esportivo.', '["Composição: 95% Poliéster, 5% Elastano","Gola polo","Casual esportivo","Secagem rápida"]',
        79.9, NULL, 39.95,
        'masculino', 'Masculino', '/produtos/masc-3.jpg', '["/produtos/masc-3.jpg"]', '["P","M","G","GG"]', '[{"name":"Azul","hex":"#1a1a5e"},{"name":"Preto","hex":"#000000"},{"name":"Branco","hex":"#FFFFFF"}]',
        4.4, 28, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 45: Conjunto Infantil Menina Rosa Legging e Top
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '45', 'Conjunto Infantil Menina Rosa Legging e Top', 'LUF-IN-001', 'Conjunto infantil para meninas com legging e top. Tecido macio e confortável.', '["Composição: 92% Poliamida, 8% Elastano","Tecido macio","Modelo confortável","Cós elástico"]',
        79.9, NULL, 39.95,
        'infantil', 'Linha Infantil', '/produtos/inf-1.jpg', '["/produtos/inf-1.jpg"]', '["4","6","8","10","12"]', '[{"name":"Rosa","hex":"#FF69B4"},{"name":"Preto","hex":"#000000"}]',
        4.8, 32, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 46: Shorts Infantil Menina com Listras Coloridas
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '46', 'Shorts Infantil Menina com Listras Coloridas', 'LUF-IN-002', 'Shorts infantil com listras coloridas laterais. Modelo esportivo para meninas ativas.', '["Composição: 90% Poliamida, 10% Elastano","Listras laterais","Cós elástico","Confortável"]',
        49.9, NULL, 24.95,
        'infantil', 'Linha Infantil', '/produtos/inf-2.jpg', '["/produtos/inf-2.jpg"]', '["4","6","8","10","12"]', '[{"name":"Preto/Listra","hex":"#333333"}]',
        4.5, 18, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 47: Bermuda Infantil Menino Azul Esporte
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '47', 'Bermuda Infantil Menino Azul Esporte', 'LUF-IN-003', 'Bermuda infantil masculina para esportes. Tecido leve e resistente, ideal para brincadeiras.', '["Composição: 100% Poliéster","Tecido leve","Resistente","Secagem rápida"]',
        54.9, NULL, 27.45,
        'infantil', 'Linha Infantil', '/produtos/inf-3.jpg', '["/produtos/inf-3.jpg"]', '["4","6","8","10","12"]', '[{"name":"Azul","hex":"#1a1a5e"},{"name":"Preto","hex":"#000000"}]',
        4.6, 22, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 48: Conjunto Infantil Menino Camiseta e Short
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '48', 'Conjunto Infantil Menino Camiseta e Short', 'LUF-IN-036', 'Conjunto infantil masculino com camiseta e short. Confortável para brincadeiras ao ar livre.', '["Composição: 100% Algodão","Confortável","Resistente","Para brincadeiras"]',
        69.9, 89.9, 34.95,
        'infantil', 'Linha Infantil', '/produtos/inf-3.jpg', '["/produtos/inf-3.jpg"]', '["4","6","8","10","12"]', '[{"name":"Azul/Preto","hex":"#1a1a5e"}]',
        4.7, 35, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 49: Macacão Infantil Menina Rosa Florido
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '49', 'Macacão Infantil Menina Rosa Florido', 'LUF-IN-037', 'Macacão infantil rosa com estampa floral. Super fofinho e confortável.', '["Composição: 95% Algodão, 5% Elastano","Estampa floral","Fofinho","Confortável"]',
        89.9, NULL, 44.95,
        'infantil', 'Linha Infantil', '/produtos/inf-1.jpg', '["/produtos/inf-1.jpg"]', '["4","6","8","10"]', '[{"name":"Rosa","hex":"#FF69B4"}]',
        4.9, 47, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 50: Legging Infantil Menina Brilhante Preta
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '50', 'Legging Infantil Menina Brilhante Preta', 'LUF-IN-038', 'Legging infantil com brilho sutil. Modelo confortável e divertido para as pequenas.', '["Composição: 90% Poliamida, 10% Elastano","Brilho sutil","Confortável","Divertido"]',
        59.9, NULL, 29.95,
        'infantil', 'Linha Infantil', '/produtos/inf-1.jpg', '["/produtos/inf-1.jpg"]', '["4","6","8","10","12"]', '[{"name":"Preto","hex":"#000000"},{"name":"Rosa","hex":"#FF69B4"}]',
        4.6, 26, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 51: Maiô Fitness com Recortes Preto
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '51', 'Maiô Fitness com Recortes Preto', 'LUF-MP-039', 'Maiô fitness com recortes estratégicos. Serve tanto para treino quanto para praia.', '["Composição: 88% Poliamida, 12% Elastano","Recortes","Versátil","Bojo removível"]',
        129.9, 169.9, 64.95,
        'praia', 'Moda Praia', '/produtos/top-5.jpg', '["/produtos/top-5.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Azul","hex":"#1a1a5e"}]',
        4.7, 54, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 52: Biquíni Esportivo Top e Calcinha Turquesa
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '52', 'Biquíni Esportivo Top e Calcinha Turquesa', 'LUF-MP-040', 'Biquíni esportivo com top estilo cropped e calcinha de cós alto. Confortável e estiloso.', '["Composição: 90% Poliamida, 10% Elastano","Top cropped","Cós alto","Esportivo"]',
        99.9, NULL, 49.95,
        'praia', 'Moda Praia', '/produtos/top-3.jpg', '["/produtos/top-3.jpg"]', '["P","M","G"]', '[{"name":"Turquesa","hex":"#2DD4A8"},{"name":"Preto","hex":"#000000"}]',
        4.6, 41, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 53: Saída de Praia Tela Branca Transparente
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '53', 'Saída de Praia Tela Branca Transparente', 'LUF-MP-041', 'Saída de praia em tela transparente. Estilosa e leve para usar sobre o biquíni.', '["Composição: 100% Poliéster","Tela transparente","Leve","Estilosa"]',
        79.9, NULL, 39.95,
        'praia', 'Moda Praia', '/produtos/blusa-1.jpg', '["/produtos/blusa-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Branco","hex":"#FFFFFF"},{"name":"Preto","hex":"#000000"}]',
        4.5, 33, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 54: Canga Multifuncional Estampada
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '54', 'Canga Multifuncional Estampada', 'LUF-MP-042', 'Canga multifuncional estampada. Pode ser usada como saída de praia, pareô ou toalha.', '["Composição: 100% Viscose","Multifuncional","Estampada","Leve"]',
        49.9, 69.9, 24.95,
        'praia', 'Moda Praia', '/produtos/conjunto-1.jpg', '["/produtos/conjunto-1.jpg"]', '["U"]', '[{"name":"Estampada","hex":"#333333"}]',
        4.3, 19, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 55: Sunga Boxer Masculina Preta
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '55', 'Sunga Boxer Masculina Preta', 'LUF-MP-043', 'Sunga boxer masculina modelo esportivo. Confortável e de secagem rápida.', '["Composição: 82% Poliamida, 18% Elastano","Modelo boxer","Secagem rápida","Esportivo"]',
        69.9, NULL, 34.95,
        'praia', 'Moda Praia', '/produtos/masc-2.jpg', '["/produtos/masc-2.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Azul","hex":"#1a1a5e"}]',
        4.5, 37, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 56: Legging Lupo Sport Max Preta
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '56', 'Legging Lupo Sport Max Preta', 'LUP-LG-001', 'Legging Lupo Sport Max com tecido texturizado a ar. Alta compressão, respirável e sem transparência. Tecnologia Seamless Dry.', '["Composição: 96% Poliamida, 4% Elastano","Tecnologia Seamless Dry","Sem costura","Alta compressão"]',
        184.99, 219.99, 92.50,
        'lupo', 'Leggings', '/produtos/legging-1.jpg', '["/produtos/legging-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#666666"}]',
        4.8, 128, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 57: Legging Lupo Pocket 5 Bolsos
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '57', 'Legging Lupo Pocket 5 Bolsos', 'LUP-LG-002', 'Legging Lupo com 5 bolsos estratégicos. Ideal para corrida e treino outdoor. Tecido de alta compressão com secagem rápida.', '["Composição: 96% Poliamida, 4% Elastano","5 bolsos","Secagem rápida","Alta compressão"]',
        175.74, 184.99, 87.87,
        'lupo', 'Leggings', '/produtos/legging-3.jpg', '["/produtos/legging-3.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Marinho","hex":"#1a1a5e"}]',
        4.7, 94, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 58: Camiseta Lupo Dry Fit Branca
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '58', 'Camiseta Lupo Dry Fit Branca', 'LUP-CM-003', 'Camiseta Lupo Dry Fit com tecnologia de secagem ultrarrápida. Leve, respirável e confortável para qualquer treino.', '["Composição: 100% Poliéster","Dry Fit","Secagem rápida","Leve"]',
        69.9, NULL, 34.95,
        'lupo', 'Camisetas', '/produtos/blusa-1.jpg', '["/produtos/blusa-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Branco","hex":"#FFFFFF"},{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#999999"}]',
        4.5, 67, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 59: Conjunto Lupo Legging + Top
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '59', 'Conjunto Lupo Legging + Top', 'LUP-CJ-004', 'Conjunto Lupo com legging de alta compressão e top com sustentação média. Kit completo para seu treino.', '["Composição: 96% Poliamida, 4% Elastano","Alta compressão","Sustentação média","Conjunto completo"]',
        129.9, 159.9, 64.95,
        'lupo', 'Conjuntos', '/produtos/conjunto-1.jpg', '["/produtos/conjunto-1.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Rosa","hex":"#FF69B4"}]',
        4.6, 83, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 60: Conjunto Selene Top + Shorts Canelado
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '60', 'Conjunto Selene Top + Shorts Canelado', 'SEL-CJ-001', 'Conjunto Selene canelado sem costura. Top com bojo removível e shorts de cós alto. Zero transparência e máximo conforto.', '["Composição: 93% Poliamida, 7% Elastano","Sem costura","Bojo removível","Zero transparência"]',
        116.37, 159.9, 58.19,
        'selene', 'Conjuntos', '/produtos/top-1.jpg', '["/produtos/top-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Rosa","hex":"#FF69B4"},{"name":"Preto","hex":"#000000"},{"name":"Azul Marinho","hex":"#1a1a5e"}]',
        4.9, 156, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 61: Top Selene com Bojo Removível Azul
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '61', 'Top Selene com Bojo Removível Azul', 'SEL-TP-002', 'Top Selene com bojo removível e alças reguláveis. Modelo nadador com sustentação perfeita. Tecido macio e respirável.', '["Composição: 93% Poliamida, 7% Elastano","Bojo removível","Alças reguláveis","Respirável"]',
        52.11, NULL, 26.05,
        'selene', 'Top', '/produtos/top-3.jpg', '["/produtos/top-3.jpg"]', '["P","M","G"]', '[{"name":"Azul Marinho","hex":"#1a1a5e"},{"name":"Preto","hex":"#000000"},{"name":"Rosa","hex":"#FF69B4"}]',
        4.7, 112, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 62: Legging Selene Básica Sem Costura
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '62', 'Legging Selene Básica Sem Costura', 'SEL-LG-003', 'Legging Selene básica sem costura. Modelagem clássica com cintura alta e compressão leve. Ideal para yoga e pilates.', '["Composição: 93% Poliamida, 7% Elastano","Sem costura","Cintura alta","Compressão leve"]',
        69.9, NULL, 34.95,
        'selene', 'Calças', '/produtos/legging-5.jpg', '["/produtos/legging-5.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#666666"}]',
        4.6, 89, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 63: Top Básico Alcinha Preto Essencial
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '64', 'Top Básico Alcinha Preto Essencial', 'LUF-TP-BAS-01', 'Top básico alcinha, peça essencial para qualquer treino. Tecido leve, confortável e com ótimo custo-benefício.', '["Composição: 90% Poliamida, 10% Elastano","Modelo alcinha","Custo-benefício","Básico"]',
        29.9, NULL, 14.95,
        'tops', 'Tops & Croppeds', '/produtos/top-1.jpg', '["/produtos/top-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Branco","hex":"#FFFFFF"},{"name":"Cinza","hex":"#808080"}]',
        4.3, 312, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 64: Legging Fitness Cintura Alta Preta Básica
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '65', 'Legging Fitness Cintura Alta Preta Básica', 'LUF-LG-BAS-02', 'Legging cintura alta básica, o melhor custo-benefício da LUFIT. Compressão média, tecido confortável e não transparente.', '["Composição: 88% Poliamida, 12% Elastano","Cintura alta","Não transparente","Básico essencial"]',
        59.9, 89.9, 29.95,
        'leggings', 'Leggings', '/produtos/legging-1.jpg', '["/produtos/legging-1.jpg"]', '["PP","P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Azul Marinho","hex":"#1a1a5e"}]',
        4.5, 567, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 65: Shorts Curto Running Preto com Bolso
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '66', 'Shorts Curto Running Preto com Bolso', 'LUF-SH-RUN-03', 'Shorts curto running com bolso lateral para celular. Ideal para corridas e treinos de alta intensidade.', '["Composição: 92% Poliamida, 8% Elastano","Bolso lateral","Leve","Secagem rápida"]',
        39.9, NULL, 19.95,
        'shorts', 'Shorts & Bermudas', '/produtos/short-1.jpg', '["/produtos/short-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.4, 198, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 66: Camiseta Oversized Feminina Cinza Mescla
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '67', 'Camiseta Oversized Feminina Cinza Mescla', 'LUF-BL-OVE-04', 'Camiseta oversized feminina, modelo soltinho e super confortável. Perfeita para o pós-treino ou uso casual.', '["Composição: 95% Algodão, 5% Elastano","Oversized","Confortável","Casual"]',
        49.9, 69.9, 24.95,
        'blusas', 'Blusas & Camisetas', '/produtos/blusa-2.jpg', '["/produtos/blusa-2.jpg"]', '["P","M","G","GG"]', '[{"name":"Cinza Mescla","hex":"#9EA7B0"},{"name":"Preto","hex":"#000000"},{"name":"Branco","hex":"#FFFFFF"}]',
        4.6, 245, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 67: Conjunto Básico Top + Shorts Preto
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '68', 'Conjunto Básico Top + Shorts Preto', 'LUF-CJ-BAS-05', 'Conjunto básico com top e shorts coordenados. Look completo pronto para o treino. Ótimo custo-benefício.', '["Composição: 90% Poliamida, 10% Elastano","Look completo","Coordenado","Básico"]',
        79.9, 109.9, 39.95,
        'conjuntos', 'Conjuntos', '/produtos/conjunto-1.jpg', '["/produtos/conjunto-1.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Rosa","hex":"#FF69B4"},{"name":"Turquesa","hex":"#2DD4A8"}]',
        4.7, 423, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 68: Legging Premium Scrunch Butt Rosa Choque
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '69', 'Legging Premium Scrunch Butt Rosa Choque', 'LUF-LG-PRM-06', 'Legging premium com efeito scrunch que valoriza o bumbum. Tecido de alta compressão, sem transparência e com acabamento impecável.', '["Composição: 88% Poliamida, 12% Elastano","Efeito scrunch","Alta compressão","Premium"]',
        139.9, 189.9, 69.95,
        'leggings', 'Leggings', '/produtos/legging-3.jpg', '["/produtos/legging-3.jpg"]', '["P","M","G","GG"]', '[{"name":"Rosa Choque","hex":"#FF1493"},{"name":"Preto","hex":"#000000"},{"name":"Lilás","hex":"#C8A2C8"}]',
        4.9, 892, true, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 69: Top Cruzado Costas Algodão Orgânico Verde
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '70', 'Top Cruzado Costas Algodão Orgânico Verde', 'LUF-TP-ECO-07', 'Top com alças cruzadas nas costas em algodão orgânico. Sustentabilidade e estilo para seu treino.', '["Composição: 95% Algodão orgânico, 5% Elastano","Sustentável","Alças cruzadas","Confortável"]',
        54.9, NULL, 27.45,
        'tops', 'Tops & Croppeds', '/produtos/top-4.jpg', '["/produtos/top-4.jpg"]', '["P","M","G"]', '[{"name":"Verde Militar","hex":"#4B5320"},{"name":"Preto","hex":"#000000"},{"name":"Vinho","hex":"#722F37"}]',
        4.5, 156, true, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 70: Bermuda Biker 3/4 Compressão Alta Preta
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '71', 'Bermuda Biker 3/4 Compressão Alta Preta', 'LUF-SH-BKR-08', 'Bermuda biker 3/4 de alta compressão. Modelo que modela e valoriza a silhueta. Ideal para bike e musculação.', '["Composição: 90% Poliamida, 10% Elastano","Compressão alta","Modeladora","3/4"]',
        69.9, 99.9, 34.95,
        'shorts', 'Shorts & Bermudas', '/produtos/short-2.jpg', '["/produtos/short-2.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.7, 334, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 71: Jaqueta Corta-Vento Refletiva Preta
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '72', 'Jaqueta Corta-Vento Refletiva Preta', 'LUF-CA-CV-09', 'Jaqueta corta-vento com detalhes refletivos para corridas noturnas. Leve, dobrável e resistente à água.', '["Composição: 100% Poliéster","Refletiva","Resistente à água","Leve"]',
        149.9, 199.9, 74.95,
        'casacos', 'Casacos & Jaquetas', '/produtos/casaco-1.jpg', '["/produtos/casaco-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Preto","hex":"#000000"},{"name":"Prata","hex":"#C0C0C0"}]',
        4.6, 89, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 72: Macaquinho Fitness All-in-One Preto
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '73', 'Macaquinho Fitness All-in-One Preto', 'LUF-MQ-ALL-10', 'Macaquinho all-in-one, prático e estiloso. Modelo completo que elimina a preocupação de coordenar peças.', '["Composição: 90% Poliamida, 10% Elastano","All-in-one","Prático","Estiloso"]',
        119.9, 159.9, 59.95,
        'macaquinhos', 'Macaquinhos', '/produtos/macacao-1.jpg', '["/produtos/macacao-1.jpg"]', '["P","M","G"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.8, 178, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 73: Saída de Praia Longa Branca Transparente
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '74', 'Saída de Praia Longa Branca Transparente', 'LUF-MP-SAI-11', 'Saída de praia longa e leve, modelo transparente que combina com qualquer biquíni. Essencial para o verão.', '["Composição: 100% Viscose","Longa","Transparente","Leve"]',
        59.9, NULL, 29.95,
        'praia', 'Moda Praia', '/produtos/blusa-1.jpg', '["/produtos/blusa-1.jpg"]', '["P","M","G","GG"]', '[{"name":"Branco","hex":"#FFFFFF"},{"name":"Preto","hex":"#000000"}]',
        4.4, 67, false, false, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

    -- Produto 74: Mochila Esportiva Impermeável Preta 25L
    INSERT INTO products (
        legacy_id, name, sku, description, specifications,
        price, old_price, cost_price,
        category, subcategory, image, images, sizes, colors,
        rating, review_count, is_new, is_sale, is_active, supplier_id
    ) VALUES (
        '75', 'Mochila Esportiva Impermeável Preta 25L', 'LUF-AC-MOC-12', 'Mochila esportiva impermeável 25 litros. Compartimento para notebook, bolso térmico e alças acolchoadas.', '["Capacidade: 25L","Impermeável","Compartimento notebook","Bolso térmico"]',
        199.9, 249.9, 99.95,
        'acessorios', 'Acessórios', '/produtos/casaco-1.jpg', '["/produtos/casaco-1.jpg"]', '["U"]', '[{"name":"Preto","hex":"#000000"},{"name":"Cinza","hex":"#808080"}]',
        4.7, 203, false, true, true, v_supplier_id
    )
    ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        cost_price = EXCLUDED.cost_price,
        supplier_id = EXCLUDED.supplier_id,
        updated_at = NOW();

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
