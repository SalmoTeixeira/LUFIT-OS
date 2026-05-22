import { Link } from 'react-router-dom';
import { Truck, MapPin, AlertCircle, Package } from 'lucide-react';

export default function EntregasPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Prazos e Entregas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">PRAZOS E ENTREGAS</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-8">
            A <strong>LUFIT</strong> envia para todo o Brasil através de transportadoras parceiras. O prazo de entrega começa a contar a partir da confirmação do pagamento e varia de acordo com a região.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-xl border p-5 text-center">
              <MapPin className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
              <h3 className="font-bold text-lufit-dark mb-1">Goiânia/GO</h3>
              <p className="text-sm text-gray-500">1 a 3 dias úteis</p>
            </div>
            <div className="bg-white rounded-xl border p-5 text-center">
              <Truck className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
              <h3 className="font-bold text-lufit-dark mb-1">Sudeste</h3>
              <p className="text-sm text-gray-500">3 a 7 dias úteis</p>
            </div>
            <div className="bg-white rounded-xl border p-5 text-center">
              <Package className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
              <h3 className="font-bold text-lufit-dark mb-1">Demais Regiões</h3>
              <p className="text-sm text-gray-500">5 a 12 dias úteis</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">RASTREAMENTO</h2>
          <p className="text-gray-600 mb-6">
            Assim que seu pedido for enviado, você receberá um e-mail com o código de rastreamento e o link para acompanhar a entrega em tempo real.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">IMPORTANTE</h2>
          <div className="bg-gray-50 rounded-lg p-5 mb-8 space-y-2">
            <p className="text-sm text-gray-600 flex items-start gap-2"><AlertCircle className="w-4 h-4 text-lufit-teal mt-0.5 shrink-0" /> O prazo pode sofrer alterações em feriados, promoções ou eventos externos.</p>
            <p className="text-sm text-gray-600 flex items-start gap-2"><AlertCircle className="w-4 h-4 text-lufit-teal mt-0.5 shrink-0" /> Certifique-se de que o endereço de entrega está correto e completo.</p>
            <p className="text-sm text-gray-600 flex items-start gap-2"><AlertCircle className="w-4 h-4 text-lufit-teal mt-0.5 shrink-0" /> Após 3 tentativas de entrega sem sucesso, o pedido retornará ao centro de distribuição.</p>
          </div>

          <p className="text-sm text-gray-500 mt-8">Dúvidas? Entre em contato pelo WhatsApp (62) 98413-7182.</p>
        </div>
      </div>
    </main>
  );
}
