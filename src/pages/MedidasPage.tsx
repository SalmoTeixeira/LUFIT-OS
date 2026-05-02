import { Link } from 'react-router-dom';
import { Ruler } from 'lucide-react';

export default function MedidasPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Tabela de Medidas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">TABELA DE MEDIDAS</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-gray-600 mb-8">
          Use uma fita métrica para tirar suas medidas e encontre o tamanho ideal. Se estiver entre dois tamanhos, recomendamos o maior para maior conforto.
        </p>

        <div className="space-y-8">
          {/* Feminino Top */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-lufit-dark text-white px-5 py-3 flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              <h2 className="font-bold">TOPS E CROPPEDS</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Tamanho</th>
                    <th className="text-left px-4 py-3 font-semibold">Busto (cm)</th>
                    <th className="text-left px-4 py-3 font-semibold">Sustentação</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="px-4 py-3 font-medium">PP</td><td className="px-4 py-3">78 - 82</td><td className="px-4 py-3">A</td></tr>
                  <tr><td className="px-4 py-3 font-medium">P</td><td className="px-4 py-3">83 - 88</td><td className="px-4 py-3">B</td></tr>
                  <tr><td className="px-4 py-3 font-medium">M</td><td className="px-4 py-3">89 - 94</td><td className="px-4 py-3">C</td></tr>
                  <tr><td className="px-4 py-3 font-medium">G</td><td className="px-4 py-3">95 - 100</td><td className="px-4 py-3">D</td></tr>
                  <tr><td className="px-4 py-3 font-medium">GG</td><td className="px-4 py-3">101 - 106</td><td className="px-4 py-3">E</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Feminino Legging */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-lufit-dark text-white px-5 py-3 flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              <h2 className="font-bold">LEGGINGS, SHORTS E BERMUDAS</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Tamanho</th>
                    <th className="text-left px-4 py-3 font-semibold">Cintura (cm)</th>
                    <th className="text-left px-4 py-3 font-semibold">Quadril (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="px-4 py-3 font-medium">PP</td><td className="px-4 py-3">60 - 64</td><td className="px-4 py-3">86 - 90</td></tr>
                  <tr><td className="px-4 py-3 font-medium">P</td><td className="px-4 py-3">65 - 70</td><td className="px-4 py-3">91 - 96</td></tr>
                  <tr><td className="px-4 py-3 font-medium">M</td><td className="px-4 py-3">71 - 76</td><td className="px-4 py-3">97 - 102</td></tr>
                  <tr><td className="px-4 py-3 font-medium">G</td><td className="px-4 py-3">77 - 82</td><td className="px-4 py-3">103 - 108</td></tr>
                  <tr><td className="px-4 py-3 font-medium">GG</td><td className="px-4 py-3">83 - 88</td><td className="px-4 py-3">109 - 114</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Feminino Blusa */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-lufit-dark text-white px-5 py-3 flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              <h2 className="font-bold">BLUSAS E MACACÕES</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Tamanho</th>
                    <th className="text-left px-4 py-3 font-semibold">Busto (cm)</th>
                    <th className="text-left px-4 py-3 font-semibold">Cintura (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="px-4 py-3 font-medium">PP</td><td className="px-4 py-3">78 - 82</td><td className="px-4 py-3">60 - 64</td></tr>
                  <tr><td className="px-4 py-3 font-medium">P</td><td className="px-4 py-3">83 - 88</td><td className="px-4 py-3">65 - 70</td></tr>
                  <tr><td className="px-4 py-3 font-medium">M</td><td className="px-4 py-3">89 - 94</td><td className="px-4 py-3">71 - 76</td></tr>
                  <tr><td className="px-4 py-3 font-medium">G</td><td className="px-4 py-3">95 - 100</td><td className="px-4 py-3">77 - 82</td></tr>
                  <tr><td className="px-4 py-3 font-medium">GG</td><td className="px-4 py-3">101 - 106</td><td className="px-4 py-3">83 - 88</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-5 mt-8">
          <h3 className="font-bold text-lufit-dark mb-2">Como medir</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><strong>Busto:</strong> Passe a fita métrica ao redor da parte mais volumosa do busto.</li>
            <li><strong>Cintura:</strong> Meça na altura do umbigo, mantendo a fita na horizontal.</li>
            <li><strong>Quadril:</strong> Meça na parte mais larga dos quadris.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
