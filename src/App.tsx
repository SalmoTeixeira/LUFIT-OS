import { useState } from 'react';

// ═════════════════════════════════════════════════════════════════════════════
// LUFIT OS - App Simplificado (React puro, sem tRPC, sem Router)
// ═════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [page, setPage] = useState<'home' | 'admin' | 'pdv'>('home');
  const [adminAuth, setAdminAuth] = useState(false);
  const [pdvSeller, setPdvSeller] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#0A0A0F', color: '#fff' }}>
      {/* Header */}
      <header style={{ background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(45,212,168,0.2)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 onClick={() => { setPage('home'); setAdminAuth(false); setPdvSeller(null); }} 
              style={{ color: '#2DD4A8', fontSize: 28, fontWeight: 900, letterSpacing: 2, cursor: 'pointer', margin: 0 }}>
            LUFIT
          </h1>
          <nav style={{ display: 'flex', gap: 24, fontSize: 14 }}>
            <button onClick={() => { setPage('home'); setAdminAuth(false); setPdvSeller(null); }} style={navStyle}>Inicio</button>
            <button onClick={() => { setPage('admin'); setPdvSeller(null); }} style={navStyle}>Admin</button>
            <button onClick={() => { setPage('pdv'); setAdminAuth(false); }} style={navStyle}>PDV</button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {page === 'home' && <HomePage />}
        {page === 'admin' && !adminAuth && <AdminLogin onLogin={() => setAdminAuth(true)} />}
        {page === 'admin' && adminAuth && <AdminPage />}
        {page === 'pdv' && !pdvSeller && <PdvLogin onLogin={setPdvSeller} />}
        {page === 'pdv' && pdvSeller && <PdvPage seller={pdvSeller} onLogout={() => setPdvSeller(null)} />}
      </main>

      {/* Footer */}
      <footer style={{ background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(45,212,168,0.2)', marginTop: 80, padding: '32px 24px', textAlign: 'center', color: '#888', fontSize: 14 }}>
        <p style={{ margin: 0 }}>LUFIT Moda Praia e Fitness &copy; 2026</p>
        <p style={{ margin: '8px 0 0', fontSize: 12 }}>Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

const navStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 };

// ═════════════════════════════════════════════════════════════════════════════
// HOME PAGE
// ═════════════════════════════════════════════════════════════════════════════
function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ background: 'linear-gradient(90deg, rgba(45,212,168,0.1), transparent)', borderRadius: 24, padding: '40px 20px' }}>
          <h2 style={{ fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: 900, margin: '0 0 16px', background: 'linear-gradient(90deg, #2DD4A8, #00A3E0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LUFIT OS
          </h2>
          <p style={{ fontSize: 20, color: '#aaa', margin: '0 0 8px' }}>Moda Praia e Fitness</p>
          <p style={{ fontSize: 14, color: '#2DD4A8' }}>v4.0 - Supabase + Vercel</p>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '20px 0' }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Categorias</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {['Novidades', 'Fitness', 'Praia', 'Colecoes', 'Lupo Sport', 'Selene', 'Masculino', 'Infantil', 'Intima', 'Acessorios', 'Atacado', 'Promocoes'].map(cat => (
            <div key={cat} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(45,212,168,0.5)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>
                {cat === 'Novidades' ? '✨' : cat === 'Fitness' ? '💪' : cat === 'Praia' ? '🏖️' : cat === 'Colecoes' ? '👗' : cat === 'Lupo Sport' ? '🦁' : cat === 'Selene' ? '🌙' : cat === 'Masculino' ? '👔' : cat === 'Infantil' ? '👶' : cat === 'Intima' ? '👙' : cat === 'Acessorios' ? '👜' : cat === 'Atacado' ? '📦' : '🏷️'}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section style={{ padding: '40px 0' }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Destaques</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { name: 'Legging Premium', price: 'R$ 149,90', cat: 'Fitness' },
            { name: 'Top Esportivo', price: 'R$ 89,90', cat: 'Fitness' },
            { name: 'Maiô Tropical', price: 'R$ 199,90', cat: 'Praia' },
            { name: 'Short Saia', price: 'R$ 119,90', cat: 'Fitness' },
            { name: 'Conjunto Yoga', price: 'R$ 249,90', cat: 'Fitness' },
            { name: 'Blusa UV', price: 'R$ 79,90', cat: 'Praia' },
            { name: 'Calça Legging', price: 'R$ 159,90', cat: 'Fitness' },
            { name: 'Body Fitness', price: 'R$ 129,90', cat: 'Fitness' },
          ].map((p, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, overflow: 'hidden' }}>
              <div style={{ height: 160, background: `linear-gradient(135deg, hsl(${i * 45}, 40%, 20%), hsl(${i * 45 + 30}, 30%, 15%))`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 12 }}>
                👕
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: 15 }}>{p.name}</h4>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: '#888' }}>{p.cat}</p>
              <p style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#2DD4A8' }}>{p.price}</p>
              <button style={{ width: '100%', padding: '10px', background: '#2DD4A8', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                Comprar
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═════════════════════════════════════════════════════════════════════════════
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pwd, setPwd] = useState('');

  return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 40 }}>
        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Painel Admin</h3>
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Senha"
          style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontSize: 16, marginBottom: 16, boxSizing: 'border-box' }} />
        <button onClick={() => pwd === 'Salmo2024' ? onLogin() : alert('Senha incorreta')}
          style={{ width: '100%', padding: 14, background: '#2DD4A8', color: '#000', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Entrar
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
function AdminPage() {
  const [tab, setTab] = useState('dashboard');

  const kpiCards = [
    { label: 'Produtos', value: '0', color: '#2DD4A8' },
    { label: 'Pedidos', value: '0', color: '#00A3E0' },
    { label: 'Clientes', value: '0', color: '#F59E0B' },
    { label: 'Faturamento', value: 'R$ 0,00', color: '#EF4444' },
  ];

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'pedidos', label: 'Pedidos' },
    { key: 'produtos', label: 'Produtos' },
    { key: 'clientes', label: 'Clientes' },
    { key: 'financeiro', label: 'Financeiro' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'pdv', label: 'PDV' },
    { key: 'config', label: 'Config' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Painel de Controle</h2>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {kpiCards.map(kpi => (
          <div key={kpi.label} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${kpi.color}33`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === t.key ? '#2DD4A8' : 'rgba(255,255,255,0.05)', color: tab === t.key ? '#000' : '#aaa' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'dashboard' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 24 }}>
          <p style={{ color: '#888' }}>Dashboard com dados em tempo real do sistema.</p>
          <p style={{ color: '#888', marginTop: 8 }}>Versao 4.0.0 - Supabase + Vercel</p>
        </div>
      )}
      {tab === 'pedidos' && <TabPlaceholder title="Pedidos" />}
      {tab === 'produtos' && <TabPlaceholder title="Produtos" />}
      {tab === 'clientes' && <TabPlaceholder title="Clientes" />}
      {tab === 'financeiro' && <TabPlaceholder title="Financeiro" />}
      {tab === 'whatsapp' && <TabPlaceholder title="WhatsApp" />}
      {tab === 'pdv' && <TabPlaceholder title="PDV" />}
      {tab === 'config' && <TabPlaceholder title="Configuracoes" />}
    </div>
  );
}

function TabPlaceholder({ title }: { title: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 24 }}>
      <h4 style={{ margin: '0 0 12px' }}>{title}</h4>
      <p style={{ color: '#888' }}>Funcionalidade em desenvolvimento.</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PDV LOGIN
// ═════════════════════════════════════════════════════════════════════════════
function PdvLogin({ onLogin }: { onLogin: (name: string) => void }) {
  const [pin, setPin] = useState('');

  const sellers: Record<string, string> = {
    '1234': 'Ana Paula (V001)',
    '5678': 'Mariana Silva (V002)',
    '9012': 'Juliana Costa (V003)',
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 40 }}>
        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>PDV Balcao</h3>
        <p style={{ color: '#888', textAlign: 'center', marginBottom: 24 }}>Digite seu PIN</p>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="----" maxLength={4}
          style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontSize: 24, textAlign: 'center', letterSpacing: 16, marginBottom: 16, boxSizing: 'border-box' }} />
        <button onClick={() => { const s = sellers[pin]; if (s) onLogin(s); else alert('PIN incorreto'); }}
          style={{ width: '100%', padding: 14, background: '#2DD4A8', color: '#000', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Entrar
        </button>
        <p style={{ color: '#666', fontSize: 11, textAlign: 'center', marginTop: 16 }}>PINs: 1234, 5678, 9012</p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PDV PAGE
// ═════════════════════════════════════════════════════════════════════════════
function PdvPage({ seller, onLogout }: { seller: string; onLogout: () => void }) {
  const [cart, setCart] = useState<Array<{ name: string; price: number; qty: number }>>([]);
  const [total, setTotal] = useState(0);

  const addItem = (name: string, price: number) => {
    const newCart = [...cart, { name, price, qty: 1 }];
    setCart(newCart);
    setTotal(newCart.reduce((s, i) => s + i.price * i.qty, 0));
  };

  const products = [
    { name: 'Legging Premium', price: 149.90 },
    { name: 'Top Esportivo', price: 89.90 },
    { name: 'Maiô Praia', price: 199.90 },
    { name: 'Short Saia', price: 119.90 },
    { name: 'Conjunto Yoga', price: 249.90 },
    { name: 'Blusa UV', price: 79.90 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>PDV - {seller}</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Sair</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Products */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Produtos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {products.map(p => (
              <button key={p.name} onClick={() => addItem(p.name, p.price)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, cursor: 'pointer', color: '#fff', textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 14, color: '#2DD4A8', fontWeight: 700, marginTop: 4 }}>R$ {p.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Carrinho</h3>
          {cart.length === 0 ? (
            <p style={{ color: '#888', fontSize: 13 }}>Adicione produtos</p>
          ) : (
            <div>
              {cart.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                  <span>{item.name}</span>
                  <span style={{ color: '#2DD4A8' }}>R$ {item.price.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '2px solid #2DD4A8', fontSize: 18, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>Total:</span>
                <span style={{ color: '#2DD4A8' }}>R$ {total.toFixed(2)}</span>
              </div>
              <button onClick={() => { setCart([]); setTotal(0); }}
                style={{ width: '100%', marginTop: 12, padding: 12, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                Finalizar Venda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
