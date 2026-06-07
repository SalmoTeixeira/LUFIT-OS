import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  is_active: boolean;
}

export function useSupabaseCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supaError } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (supaError) {
        console.error('[useSupabaseCustomers] Erro:', supaError);
        setError(supaError.message);
      } else {
        setCustomers(data as Customer[] || []);
      }
    } catch (e: any) {
      console.error('[useSupabaseCustomers] Catch:', e);
      setError(e?.message || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // Fallback: se nao conseguir do Supabase, usa clientes locais para teste
  const finalCustomers = customers.length > 0 ? customers : MOCK_CUSTOMERS;

  return { customers: finalCustomers, isLoading, error, refresh: fetchCustomers };
}

// Clientes de teste locais (fallback quando Supabase nao responde)
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'mock-01', name: 'CLIENTE TESTE 01', email: 'cliente01@teste.com',
    phone: '(62) 99111-0001', cpf: '111.111.111-11', cep: '74000-000',
    street: 'Rua Teste 01', number: '100', complement: '',
    neighborhood: 'Centro', city: 'Goiania', state: 'GO', is_active: true
  },
  {
    id: 'mock-02', name: 'CLIENTE TESTE 02', email: 'cliente02@teste.com',
    phone: '(62) 99222-0002', cpf: '222.222.222-22', cep: '74000-001',
    street: 'Rua Teste 02', number: '200', complement: '',
    neighborhood: 'Setor Oeste', city: 'Goiania', state: 'GO', is_active: true
  },
  {
    id: 'mock-03', name: 'CLIENTE TESTE 03', email: 'cliente03@teste.com',
    phone: '(62) 99333-0003', cpf: '333.333.333-33', cep: '74000-002',
    street: 'Rua Teste 03', number: '300', complement: '',
    neighborhood: 'Jardim America', city: 'Goiania', state: 'GO', is_active: true
  },
];
