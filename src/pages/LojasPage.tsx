import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';

export default function LojasPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Nossas Lojas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">NOSSAS LOJAS</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-gray-600 mb-8">
          Visite nossa loja física em Goiânia! Temos um ambiente acolhedor onde você pode experimentar todas as peças e receber atendimento personalizado.
        </p>

        <div className="bg-white rounded-xl border overflow-hidden mb-8">
          <div className="relative h-64">
            <iframe
              title="Loja LUFIT"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3821.755756060395!2d-49.3115!3d-16.6869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ef36356733b77%3A0x7eb8afff26d98d2b!2sLUFIT+Moda+Fitness!5e0!3m2!1spt-BR!2sbr!4v1715100000000!5m2!1spt-BR!2sbr"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-lufit-teal" />
              <h2 className="text-lg font-bold text-lufit-dark">Loja LUFIT - Goiânia/GO</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Av. Goiânia, Qd. 73 - Lt 10<br />
              Jardim Guanabara I, Goiânia - GO<br />
              CEP: 74675-320
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-lufit-teal" />
                Seg a Sex: 09h - 19h | Sáb: 09h - 13h
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-lufit-teal" />
                (62) 99394-0034 | (62) 99449-0177
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir//Av.+Goiânia,+Qd.+73+-+Lt+10+-+Jardim+Guanabara+I,+Goiânia+-+GO,+74675-320"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-lufit-teal text-lufit-dark font-bold px-6 py-2.5 rounded-lg hover:bg-lufit-teal/90 transition-colors text-sm"
            >
              <Navigation className="w-4 h-4" />
              Como Chegar
            </a>
          </div>
        </div>

        <div className="bg-lufit-dark rounded-xl p-6 text-white text-center">
          <h3 className="font-bold text-lg mb-2">COMPRA ONLINE COM RETIRADA NA LOJA</h3>
          <p className="text-sm text-gray-400 mb-4">
            Faça seu pedido online e retire na loja sem pagar frete! Atendimento rápido e exclusivo.
          </p>
          <Link to="/" className="inline-block bg-lufit-teal text-lufit-dark font-bold px-6 py-2.5 rounded-lg hover:bg-lufit-teal/90 transition-colors text-sm">
            Comprar Agora
          </Link>
        </div>
      </div>
    </main>
  );
}
