const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabase = createClient(
  'https://dgzgqblkcewqqfmqqzbs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnemdxYmxrY2V3cXFmbXFxemJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA0NjcyMywiZXhwIjoyMDk0NjIyNzIzfQ.aLbqJk7dG_lLJPFo5U5eEb9dKYkUHXCxFLBTbKnFDNo',
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket }
  }
);

async function main() {
  // Verificar tabelas existentes usando RPC
  const { data: tables, error } = await supabase
    .rpc('get_schema_tables', { schema_name: 'public' });

  if (error) {
    console.log('RPC get_schema_tables não existe, tentando query direta...');
    console.log('Error:', error.message);

    // Tentar SELECT direto na tabela products
    const { data: prod, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (prodErr) {
      console.log('Tabela products NÃO existe:', prodErr.message);
    } else {
      console.log('Tabela products EXISTE');
    }

    // Tentar suppliers
    const { data: sup, error: supErr } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1);

    if (supErr) {
      console.log('Tabela suppliers NÃO existe:', supErr.message);
    } else {
      console.log('Tabela suppliers EXISTE');
    }

    // Tentar inventory
    const { data: inv, error: invErr } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);

    if (invErr) {
      console.log('Tabela inventory NÃO existe:', invErr.message);
    } else {
      console.log('Tabela inventory EXISTE');
    }

    // Tentar users/auth
    const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
    if (usersErr) {
      console.log('Auth admin error:', usersErr.message);
    } else {
      console.log('Usuários existentes:', users.users.length);
    }

  } else {
    console.log('Tabelas encontradas:', tables);
  }
}

main().catch(console.error);
