import { Link } from 'react-router-dom';
import { Truck, RotateCcw, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function TrocasPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Trocas e Devoluções</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">TROCAS E DEVOLUÇÕES</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-8">
            Na <strong>LUFIT Moda Praia e Fitness</strong>, sua satisfação é prioridade. Seguimos rigorosamente o Código de Defesa do Consumidor e facilitamos ao máximo o processo de trocas e devoluções.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-xl border p-5 text-center">
              <RotateCcw className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
              <h3 className="font-bold text-lufit-dark mb-1">7 Dias</h3>
              <p className="text-sm text-gray-500">Direito de arrependimento para devolução</p>
            </div>
            <div className="bg-white rounded-xl border p-5 text-center">
              <CheckCircle className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
              <h3 className="font-bold text-lufit-dark mb-1">30 Dias</h3>
              <p className="text-sm text-gray-500">Prazo para troca por tamanho ou defeito</p>
            </div>
            <div className="bg-white rounded-xl border p-5 text-center">
              <Truck className="w-8 h-8 text-lufit-teal mx-auto mb-3" />
              <h3 className="font-bold text-lufit-dark mb-1">Frete Grátis</h3>
              <p className="text-sm text-gray-500">Na primeira troca, enviamos o retorno por nossa conta</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">COMO SOLICITAR UMA TROCA</h2>
          <ol className="list-decimal pl-6 text-gray-600 space-y-3 mb-8">
            <li>Entre em contato pelo WhatsApp <strong>(62) 98413-7182</strong> ou e-mail <strong>lufitmoda@gmail.com</strong> informando o número do pedido.</li>
            <li>Aguarde a autorização com as instruções de envio.</li>
            <li>Envie o produto na embalagem original, com etiqueta e sem sinais de uso.</li>
            <li>Assim que recebermos, analisaremos e enviaremos o novo produto ou efetuaremos o estorno.</li>
          </ol>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">CONDIÇÕES PARA TROCA</h2>
          <div className="bg-gray-50 rounded-lg p-5 mb-8">
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal mt-1 shrink-0" /> Produto com etiqueta afixada</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal mt-1 shrink-0" /> Sem sinais de uso, lavagem ou odor</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal mt-1 shrink-0" /> Embalagem original preservada</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-lufit-teal mt-1 shrink-0" /> Nota fiscal ou comprovante de compra</li>
            </ul>
          </div>

          <div className="bg-lufit-red/5 border border-lufit-red/20 rounded-lg p-5 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-lufit-red mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-lufit-red text-sm mb-1">IMPORTANTE</h4>
                <p className="text-sm text-gray-600">Produtos de moda íntima (calcinhas, cuecas) e itens personalizados não são elegíveis para troca por questões de higiene, conforme o CDC.</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">DEVOLUÇÃO E ESTORNO</h2>
          <p className="text-gray-600 mb-6">
            O estorno é realizado em até <strong>10 dias úteis</strong> após a aprovação da devolução, através da mesma forma de pagamento utilizada na compra. Para pagamentos via boleto ou Pix, será solicitado dados bancários para transferência.
          </p>

          <div className="text-center mt-10">
            <a href="https://wa.me/5562993940034" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-lufit-teal text-lufit-dark font-bold px-8 py-3 rounded-lg hover:bg-lufit-teal/90 transition-colors">
              <Clock className="w-4 h-4" />
              Falar com Atendimento
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
