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
            A <strong>LUFIT</strong> envia para todo o Brasil através das melhores transportadoras parceiras. Nossos fretes são os <strong>mais rápidos e com os melhores preços do mercado</strong>. O valor do frete é calculado automaticamente no checkout com base no CEP de entrega.
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

          {/* Retirada na Loja */}
          <div className="bg-lufit-dark rounded-xl p-6 sm:p-8 mb-10">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-lufit-teal" />
              RETIRADA NA LOJA FÍSICA
            </h2>
            <p className="text-white/80 mb-4">
              Você também tem a opção de <strong className="text-white">retirar seu pedido pessoalmente em nossa loja física</strong> em Goiânia, sem pagar frete! Após a confirmação do pagamento, seu pedido será separado e você receberá um <strong className="text-lufit-teal">código de autorização de retirada</strong> via WhatsApp ou e-mail.
            </p>
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-white mb-2">Como funciona:</h3>
              <ol className="text-white/80 text-sm space-y-1.5 list-decimal list-inside">
                <li>Finalize sua compra e selecione <strong className="text-lufit-teal">"Retirada na Loja"</strong> como forma de entrega</li>
                <li>Após a confirmação do pagamento, aguarde a notificação de separação do pedido</li>
                <li>Receba seu <strong className="text-lufit-teal">código de autorização de retirada</strong></li>
                <li>Dirija-se à nossa loja com seu <strong>documento de identificação</strong> e o código de autorização</li>
                <li>Retire seu pedido sem filas e com atendimento exclusivo!</li>
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/5562993940034"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-lufit-teal text-lufit-dark font-bold px-6 py-3 rounded-lg hover:bg-lufit-teal/90 transition-colors text-sm"
              >
                Agendar Retirada pelo WhatsApp
              </a>
              <Link
                to="/lojas"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-bold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Ver Endereço da Loja
              </Link>
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
