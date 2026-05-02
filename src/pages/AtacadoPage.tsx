import { useState } from 'react';
import { Users, Package, Percent, Truck, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AtacadoPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[250px] sm:h-[300px] overflow-hidden">
        <img src="/banners/banner-1.jpg" alt="Atacado LUFIT" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-lufit-dark/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl sm:text-4xl font-black font-heading mb-2">ATACADO LUFIT</h1>
            <p className="text-base text-white/80">Revenda moda fitness e praia com os melhores preços</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-xl border p-5 text-center">
            <Percent className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
            <h3 className="font-bold text-lufit-dark mb-1">Preço Imbatível</h3>
            <p className="text-sm text-gray-500">Descontos progressivos a partir de 6 peças</p>
          </div>
          <div className="bg-white rounded-xl border p-5 text-center">
            <Package className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
            <h3 className="font-bold text-lufit-dark mb-1">Variedade</h3>
            <p className="text-sm text-gray-500">Acesse todo o catálogo fitness e praia</p>
          </div>
          <div className="bg-white rounded-xl border p-5 text-center">
            <Truck className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
            <h3 className="font-bold text-lufit-dark mb-1">Envio Rápido</h3>
            <p className="text-sm text-gray-500">Despacho prioritário para revendedores</p>
          </div>
          <div className="bg-white rounded-xl border p-5 text-center">
            <Users className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
            <h3 className="font-bold text-lufit-dark mb-1">Suporte VIP</h3>
            <p className="text-sm text-gray-500">Atendimento exclusivo para revenda</p>
          </div>
        </div>

        {/* Pricing tiers */}
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark text-center mb-6">
          TABELA DE DESCONTOS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border p-6">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lufit-dark">6 a 11 peças</h3>
              <div className="text-3xl font-black text-lufit-teal mt-2">15% OFF</div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal" /> Qualquer mix de produtos</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal" /> Frete calculado por região</li>
            </ul>
          </div>
          <div className="bg-lufit-dark rounded-xl p-6 text-white relative">
            <span className="absolute top-3 right-3 bg-lufit-teal text-lufit-dark text-xs font-bold px-2 py-1 rounded">MAIS POPULAR</span>
            <div className="text-center mb-4">
              <h3 className="font-bold">12 a 23 peças</h3>
              <div className="text-3xl font-black text-lufit-teal mt-2">25% OFF</div>
            </div>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal" /> Qualquer mix de produtos</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal" /> Frete com desconto</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal" /> Materiais de divulgação</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lufit-dark">24+ peças</h3>
              <div className="text-3xl font-black text-lufit-teal mt-2">35% OFF</div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal" /> Preços exclusivos</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal" /> Frete grátis Sudeste</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal" /> Atendimento prioritário</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal" /> Catálogo digital mensal</li>
            </ul>
          </div>
        </div>

        {/* Registration form */}
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark text-center mb-6">
          CADASTRO PARA REVENDEDORA
        </h2>
        {submitted ? (
          <div className="bg-lufit-teal/10 border border-lufit-teal/20 rounded-xl p-8 text-center max-w-xl mx-auto">
            <CheckCircle className="w-12 h-12 text-lufit-teal mx-auto mb-4" />
            <h3 className="text-xl font-bold text-lufit-dark mb-2">Cadastro Recebido!</h3>
            <p className="text-gray-600">Nossa equipe comercial analisará sua solicitação e entrará em contato em até 2 dias úteis.</p>
          </div>
        ) : (
          <form className="bg-white rounded-xl border p-6 max-w-xl mx-auto space-y-5" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lufit-dark mb-1.5">Nome completo *</label>
                <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-lufit-dark mb-1.5">Nome da loja/empresa</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lufit-dark mb-1.5">CNPJ</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="00.000.000/0000-00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-lufit-dark mb-1.5">Telefone *</label>
                <input required type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-lufit-dark mb-1.5">E-mail *</label>
              <input required type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-lufit-dark mb-1.5">Cidade/Estado *</label>
              <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-lufit-dark mb-1.5">Previsão de volume mensal</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal">
                <option>6 a 11 peças</option>
                <option>12 a 23 peças</option>
                <option>24+ peças</option>
                <option>Ainda não sei</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-lufit-dark text-white font-bold py-6 hover:bg-lufit-dark/90">
              <Phone className="w-4 h-4 mr-2" />
              SOLICITAR CADASTRO ATACADO
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
