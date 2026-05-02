import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrabalhePage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Trabalhe Conosco</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">TRABALHE CONOSCO</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-gray-600 mb-8">
          Faça parte do time da loja fitness que mais cresce no Brasil! Estamos sempre em busca de talentos apaixonados por moda e atendimento ao cliente.
        </p>

        {submitted ? (
          <div className="bg-lufit-teal/10 border border-lufit-teal/20 rounded-xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-lufit-teal mx-auto mb-4" />
            <h2 className="text-xl font-bold text-lufit-dark mb-2">Cadastro Enviado!</h2>
            <p className="text-gray-600">Obrigado pelo interesse. Nossa equipe de RH analisará seu perfil e entrará em contato em até 10 dias úteis.</p>
          </div>
        ) : (
          <form className="bg-white rounded-xl border p-6 space-y-5" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lufit-dark mb-1.5">Nome completo *</label>
                <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-sm font-medium text-lufit-dark mb-1.5">E-mail *</label>
                <input required type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="seu@email.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lufit-dark mb-1.5">Telefone *</label>
                <input required type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="(62) 99999-9999" />
              </div>
              <div>
                <label className="block text-sm font-medium text-lufit-dark mb-1.5">Data de nascimento</label>
                <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-lufit-dark mb-1.5">Área de interesse *</label>
              <select required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal">
                <option value="">Selecione...</option>
                <option>Vendas / Atendimento</option>
                <option>Marketing Digital</option>
                <option>Logística / Estoque</option>
                <option>Design / Criação</option>
                <option>Administrativo / Financeiro</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-lufit-dark mb-1.5">Pretensão salarial (opcional)</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="R$ 0,00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-lufit-dark mb-1.5">Mensagem / Apresentação</label>
              <textarea rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal resize-none" placeholder="Conte-nos sobre você e por que quer fazer parte da LUFIT" />
            </div>
            <div>
              <label className="block text-sm font-medium text-lufit-dark mb-1.5">Anexar currículo (PDF)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-lufit-teal transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Clique ou arraste seu currículo aqui</p>
                <p className="text-xs text-gray-400 mt-1">PDF até 5MB</p>
              </div>
            </div>
            <Button type="submit" className="w-full bg-lufit-dark text-white font-bold py-6 hover:bg-lufit-dark/90">
              <Briefcase className="w-4 h-4 mr-2" />
              ENVIAR CANDIDATURA
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
