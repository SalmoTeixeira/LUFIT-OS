import { Link } from 'react-router-dom';

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Termos de Uso</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">TERMOS DE USO</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Ao acessar e utilizar o site lufitness.com.br, operado pela <strong>LU MODA FITNESS LTDA</strong> (CNPJ: 50.493.781/0001-71), você concorda com os seguintes termos e condições. Leia atentamente antes de realizar qualquer compra.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">1. CADASTRO E CONTA</h2>
          <p className="text-gray-600 mb-6">
            Para realizar compras, é necessário criar uma conta fornecendo informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">2. PRODUTOS E PREÇOS</h2>
          <p className="text-gray-600 mb-6">
            Todos os preços são exibidos em Reais (R$) e podem ser alterados sem aviso prévio. Fotos e descrições dos produtos são meramente ilustrativas. Esforçamo-nos para garantir a precisão das informações, mas podem ocorrer erros de digitação ou divergências de cor devido às configurações de monitor.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">3. PAGAMENTO</h2>
          <p className="text-gray-600 mb-6">
            Aceitamos cartão de crédito (Visa, Mastercard, Elo, Amex, Hipercard, Diners), Pix, boleto bancário e cartão de débito. Parcelamos em até 12x nos cartões de crédito. Os encargos de parcelamento são de responsabilidade da operadora do cartão do cliente.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">4. ENTREGA</h2>
          <p className="text-gray-600 mb-6">
            O prazo de entrega começa a contar a partir da confirmação do pagamento. Para Goiânia e região metropolitana, o prazo médio é de 1 a 3 dias úteis. Para demais localidades, consulte o cálculo de frete no carrinho. A LUFIT não se responsabiliza por atrasos causados por fatores externos (greves, condições climáticas, etc.).
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">5. TROCAS E DEVOLUÇÕES</h2>
          <p className="text-gray-600 mb-6">
            Conforme o Código de Defesa do Consumidor, você tem até 7 dias após o recebimento para solicitar a devolução (direito de arrependimento). Para trocas por tamanho ou cor, o prazo é de até 30 dias. O produto deve estar com etiqueta e sem sinais de uso.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">6. PROPRIEDADE INTELECTUAL</h2>
          <p className="text-gray-600 mb-6">
            Todo o conteúdo do site (logos, imagens, textos, código) é propriedade da LU MODA FITNESS LTDA e está protegido por leis de direitos autorais. É proibida a reprodução sem autorização expressa.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">7. ALTERAÇÕES</h2>
          <p className="text-gray-600 mb-6">
            Reservamo-nos o direito de alterar estes termos a qualquer momento. Recomendamos a leitura periódica desta página.
          </p>

          <p className="text-sm text-gray-500 mt-8">Última atualização: Maio de 2026.</p>
        </div>
      </div>
    </main>
  );
}
