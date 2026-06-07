import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, CreditCard, QrCode, Shield, Truck, Printer, Home } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

export default function OrderSuccessPage() {
  const { cart, clearCart } = useStore();
  const [saleCode, setSaleCode] = useState('');
  const [saleTotal, setSaleTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [pixCode, setPixCode] = useState('');

  useEffect(() => {
    // Recuperar dados da venda gravada
    const code = localStorage.getItem('last_sale_code') || 'LUF-XXXX';
    const total = parseFloat(localStorage.getItem('last_sale_total') || '0');
    const pix = localStorage.getItem('last_pix_code') || '';
    const method = localStorage.getItem('last_payment_method') || 'pix';
    
    setSaleCode(code);
    setSaleTotal(total);
    setPixCode(pix);
    setPaymentMethod(method);
    
    // Limpar carrinho após mostrar comprovante
    if (cart.length > 0) {
      clearCart();
    }
  }, [cart.length, clearCart]);

  const handlePrint = () => {
    window.print();
  };

  const paymentIcon = () => {
    if (paymentMethod === 'pix') return <QrCode className="w-5 h-5 text-[#2DD4A8]" />;
    if (paymentMethod === 'card') return <CreditCard className="w-5 h-5 text-[#667eea]" />;
    if (paymentMethod === 'boleto') return <Shield className="w-5 h-5 text-amber-600" />;
    return <ShoppingBag className="w-5 h-5 text-[#2DD4A8]" />;
  };

  const paymentLabel = () => {
    if (paymentMethod === 'pix') return 'PIX';
    if (paymentMethod === 'card') return 'Cartão de Crédito';
    if (paymentMethod === 'boleto') return 'Boleto Bancário';
    return 'PIX';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#2DD4A8] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Pedido Confirmado!</h1>
          <p className="text-gray-500 mt-1">Obrigado por comprar na LUFIT</p>
        </div>

        {/* Comprovante */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Número do Pedido</span>
              <span className="font-bold text-lg text-[#2DD4A8]">{saleCode}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">Forma de Pagamento</span>
              <div className="flex items-center gap-2">
                {paymentIcon()}
                <span className="font-medium">{paymentLabel()}</span>
              </div>
            </div>
          </div>

          {/* Instruções por método */}
          {paymentMethod === 'pix' && pixCode && (
            <div className="bg-[#2DD4A8]/5 p-4 rounded-xl mb-4">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#2DD4A8]" />
                Pague com PIX
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Escaneie o QR Code ou copie o código abaixo no app do seu banco:
              </p>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <code className="text-xs break-all block">{pixCode}</code>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(pixCode)}
                className="mt-2 w-full py-2 bg-[#2DD4A8] text-black font-medium rounded-lg text-sm hover:bg-[#25b896]"
              >
                Copiar código PIX
              </button>
              <p className="text-xs text-gray-500 mt-2">
                O pedido será processado após a confirmação do pagamento.
              </p>
            </div>
          )}

          {paymentMethod === 'boleto' && (
            <div className="bg-amber-50 p-4 rounded-xl mb-4">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Boleto Bancário
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Boleto - Somente para clientes do atacado após a 3ª compra com seu cadastro aprovado.
              </p>
              <p className="text-sm text-amber-700">
                Sua solicitação foi enviada para análise. Você receberá o boleto por e-mail após aprovação.
              </p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="bg-blue-50 p-4 rounded-xl mb-4">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#667eea]" />
                Pagamento com Cartão
              </h3>
              <p className="text-sm text-gray-600">
                Seu pagamento está sendo processado. Você receberá a confirmação por e-mail em breve.
              </p>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center border-t border-gray-100 pt-4">
            <span className="text-gray-600">Total do Pedido</span>
            <span className="text-2xl font-bold text-[#2DD4A8]">
              R$ {saleTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Info envio */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-5 h-5 text-[#2DD4A8]" />
            <h3 className="font-bold text-gray-800">Envio</h3>
          </div>
          <p className="text-sm text-gray-600">
            Seu pedido será enviado em até 2 dias úteis após a confirmação do pagamento.
            Você receberá o código de rastreamento por e-mail.
          </p>
        </div>

        {/* Botoes */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <Link
            to="/"
            className="flex-1 py-3 bg-[#2DD4A8] text-black font-bold rounded-xl hover:bg-[#25b896] flex items-center justify-center gap-2 text-center"
          >
            <Home className="w-4 h-4" />
            Voltar à Loja
          </Link>
        </div>
      </div>
    </div>
  );
}
