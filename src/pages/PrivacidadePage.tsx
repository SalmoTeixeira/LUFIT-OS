import { Link } from 'react-router-dom';

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Política de Privacidade</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">POLÍTICA DE PRIVACIDADE</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            A <strong>LU MODA FITNESS LTDA</strong>, inscrita no CNPJ nº 50.493.781/0001-71, com sede em Goiânia/GO, opera o site lufitness.com.br e se compromete a proteger a privacidade de seus usuários. Esta política descreve como coletamos, usamos e protegemos seus dados pessoais.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">1. DADOS COLETADOS</h2>
          <p className="text-gray-600 mb-4">Coletamos os seguintes dados pessoais quando você:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li><strong>Cadastro:</strong> Nome completo, CPF, data de nascimento, e-mail, telefone, endereço completo.</li>
            <li><strong>Compra:</strong> Dados de pagamento (processados por gateways seguros - não armazenamos números de cartão).</li>
            <li><strong>Navegação:</strong> IP, cookies, páginas visitadas, produtos visualizados.</li>
          </ul>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">2. FINALIDADE DO USO</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Processar pedidos e entregas.</li>
            <li>Enviar comunicações sobre promoções e novidades (com consentimento).</li>
            <li>Melhorar a experiência de navegação e recomendação de produtos.</li>
            <li>Cumprir obrigações legais e fiscais.</li>
          </ul>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">3. COMPARTILHAMENTO</h2>
          <p className="text-gray-600 mb-6">
            Seus dados podem ser compartilhados com transportadoras para entrega, gateways de pagamento para processamento financeiro, e autoridades quando exigido por lei. Nunca vendemos seus dados a terceiros para fins de marketing.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">4. SEGURANÇA</h2>
          <p className="text-gray-600 mb-6">
            Utilizamos criptografia SSL, firewalls e práticas de segurança da informação para proteger seus dados. O acesso é restrito a funcionários autorizados.
          </p>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">5. SEUS DIREITOS</h2>
          <p className="text-gray-600 mb-4">Você pode, a qualquer momento:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Solicitar acesso aos seus dados.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar a exclusão de seus dados (exceto quando houver base legal para manutenção).</li>
            <li>Revogar o consentimento de envio de comunicações.</li>
          </ul>

          <h2 className="text-xl font-bold text-lufit-dark mt-8 mb-4">6. CONTATO</h2>
          <p className="text-gray-600 mb-6">
            Para exercer seus direitos ou esclarecer dúvidas, entre em contato pelo e-mail lufitmoda@gmail.com ou pelo WhatsApp (62) 98413-7182.
          </p>

          <p className="text-sm text-gray-500 mt-8">Última atualização: Maio de 2026.</p>
        </div>
      </div>
    </main>
  );
}
