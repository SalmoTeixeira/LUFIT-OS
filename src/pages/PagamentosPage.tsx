import { Link } from 'react-router-dom';
import { CreditCard, Smartphone, Receipt, Percent } from 'lucide-react';

function VisaIcon() {
  return <svg viewBox="0 0 48 32" className="h-10 w-auto"><rect width="48" height="32" rx="3" fill="#1A1F71"/><text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">VISA</text></svg>;
}
function MastercardIcon() {
  return <svg viewBox="0 0 48 32" className="h-10 w-auto"><rect width="48" height="32" rx="3" fill="#f5f5f5"/><circle cx="17" cy="16" r="10" fill="#EB001B"/><circle cx="31" cy="16" r="10" fill="#F79E1B"/><path d="M24 8.5a10 10 0 0 0 0 15 10 10 0 0 0 0-15z" fill="#FF5F00"/></svg>;
}
function AmexIcon() {
  return <svg viewBox="0 0 48 32" className="h-10 w-auto"><rect width="48" height="32" rx="3" fill="#016FD0"/><text x="24" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">AMEX</text></svg>;
}
function EloIcon() {
  return <svg viewBox="0 0 48 32" className="h-10 w-auto"><rect width="48" height="32" rx="3" fill="#000"/><text x="24" y="20" textAnchor="middle" fill="#EF8200" fontSize="10" fontWeight="bold" fontFamily="sans-serif">ELO</text></svg>;
}
function HipercardIcon() {
  return <svg viewBox="0 0 48 32" className="h-10 w-auto"><rect width="48" height="32" rx="3" fill="#B31239"/><text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">HIPER</text></svg>;
}
function DinersIcon() {
  return <svg viewBox="0 0 48 32" className="h-10 w-auto"><rect width="48" height="32" rx="3" fill="#004E94"/><text x="24" y="20" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">DINERS</text></svg>;
}
function PixIcon() {
  return <svg viewBox="0 0 48 32" className="h-10 w-auto"><rect width="48" height="32" rx="3" fill="#32BCAD"/><text x="24" y="20" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Pix</text></svg>;
}
function BoletoIcon() {
  return <svg viewBox="0 0 48 32" className="h-10 w-auto"><rect width="48" height="32" rx="3" fill="#F5F5F5"/><text x="24" y="20" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold" fontFamily="sans-serif">BOLETO</text></svg>;
}

export default function PagamentosPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Formas de Pagamento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">FORMAS DE PAGAMENTO</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-gray-600 mb-8">
          A <strong>LUFIT</strong> oferece diversas formas de pagamento para sua segurança e conveniência. Todas as transações são processadas em ambiente seguro com criptografia SSL.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-lufit-teal" />
              <h3 className="font-bold text-lufit-dark">Cartão de Crédito</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Parcelamos em até 12x nas principais bandeiras:</p>
            <div className="flex flex-wrap gap-2">
              <VisaIcon /><MastercardIcon /><AmexIcon /><EloIcon /><HipercardIcon /><DinersIcon />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-lufit-teal" />
              <h3 className="font-bold text-lufit-dark">Pix</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Pagamento instantâneo com o valor total.</p>
            <div className="flex gap-2"><PixIcon /></div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="w-6 h-6 text-lufit-teal" />
              <h3 className="font-bold text-lufit-dark">Boleto Bancário</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Compensação em até 2 dias úteis. Após a confirmação, iniciamos o processamento do pedido.</p>
            <div className="flex gap-2"><BoletoIcon /></div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Percent className="w-6 h-6 text-lufit-teal" />
              <h3 className="font-bold text-lufit-dark">Descontos Especiais</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>PIX: pagamento instantâneo</li>
              <li>Boleto: compensação em até 2 dias úteis</li>
              <li>Cartão em até 12x</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="font-bold text-lufit-dark mb-2">Segurança</h3>
          <p className="text-sm text-gray-600">
            Não armazenamos números de cartão em nossos servidores. Todas as transações financeiras são processadas por gateways certificados (PCI DSS). Site protegido com certificado SSL de 256 bits.
          </p>
        </div>
      </div>
    </main>
  );
}
