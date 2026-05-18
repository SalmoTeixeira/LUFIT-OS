import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Shield, Truck, CreditCard, RefreshCw, Ruler, Users, Store, FileText, Lock, HelpCircle, Percent } from 'lucide-react';

interface ContentPageProps {
  page: string;
}

const pages: Record<string, { title: string; subtitle: string; icon: React.ReactNode; content: React.ReactNode }> = {
  sobre: {
    title: 'Sobre Nós',
    subtitle: 'Conheça a LUFIT Moda Praia e Fitness',
    icon: <Users className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#2DD4A8]/10 to-transparent p-6 rounded-xl border-l-4 border-[#2DD4A8]">
          <h3 className="text-xl font-bold text-gray-900 mb-2">A LUFIT</h3>
          <p className="text-gray-600 leading-relaxed">
            A LUFIT Moda Praia e Fitness nasceu em 2020 em Goiânia, Goiás, com a missão de oferecer roupas de alta qualidade 
            para mulheres que buscam estilo, conforto e performance nos treinos e no dia a dia. Somos especialistas em 
            moda fitness, praia e íntima, trazendo as últimas tendências do mercado com preços justos.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Store className="w-4 h-4 text-[#2DD4A8]" /> Nossa Loja</h4>
            <p className="text-sm text-gray-600">Av. Goiânia, Qd. 73 - Lt 10 - Jardim Guanabara I, Goiânia - GO, 74675-320</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-[#2DD4A8]" /> Contato</h4>
            <p className="text-sm text-gray-600">Vendas: (62) 99394-0034 / (62) 99449-0177</p>
            <p className="text-sm text-gray-600">Email: lufitmoda@gmail.com</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-[#2DD4A8]" /> Horário de Funcionamento</h4>
            <p className="text-sm text-gray-600">Segunda a Sexta: 09h - 19h</p>
            <p className="text-sm text-gray-600">Sábado: 09h - 13h</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-[#2DD4A8]" /> CNPJ</h4>
            <p className="text-sm text-gray-600">50.493.781/0001-71</p>
            <p className="text-sm text-gray-600">LU MODA FITNESS LTDA</p>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-3">Nosso Movimento</h4>
          <p className="text-gray-600 leading-relaxed">
            O Movimento LUFIT é mais do que moda - é um estilo de vida. Acreditamos que toda mulher merece se sentir 
            confiante e poderosa, seja na academia, na praia ou no dia a dia. Nossas peças são desenvolvidas com 
            tecnologia de ponta, tecidos de alta compressão e designs que valorizam o corpo feminino.
          </p>
        </div>
      </div>
    ),
  },
  lojas: {
    title: 'Nossas Lojas',
    subtitle: 'Encontre a LUFIT mais próxima de você',
    icon: <Store className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#2DD4A8]/10 rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-[#2DD4A8]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Loja Física - Goiânia</h3>
              <p className="text-gray-600 mt-1">Av. Goiânia, Qd. 73 - Lt 10 - Jardim Guanabara I</p>
              <p className="text-gray-500 text-sm">Goiânia - GO, 74675-320</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Seg-Sex: 09h-19h | Sáb: 09h-13h</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <a href="https://wa.me/5562993940034" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#2DD4A8]/10 to-transparent p-6 rounded-xl border border-[#2DD4A8]/20">
          <h4 className="font-bold text-gray-900 mb-2">Loja Online</h4>
          <p className="text-gray-600 text-sm">
            Nossa loja online funciona 24 horas por dia, 7 dias por semana. Compre de qualquer lugar do Brasil 
            e receba no conforto da sua casa. Enviamos para todo o território nacional.
          </p>
        </div>
      </div>
    ),
  },
  'trabalhe-conosco': {
    title: 'Trabalhe Conosco',
    subtitle: 'Faça parte do time LUFIT',
    icon: <Users className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#2DD4A8]/10 to-transparent p-6 rounded-xl border-l-4 border-[#2DD4A8]">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Junte-se ao Time LUFIT</h3>
          <p className="text-gray-600 leading-relaxed">
            Estamos sempre em busca de talentos apaixonados por moda fitness e atendimento ao cliente. 
            Se você quer fazer parte de uma empresa em crescimento, envie seu currículo para nós.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2">Vendedora de Loja</h4>
            <p className="text-sm text-gray-600 mb-3">Atendimento ao cliente, organização de estoque e vendas.</p>
            <span className="text-xs bg-[#2DD4A8]/10 text-[#2DD4A8] px-2 py-1 rounded-full font-medium">Goiânia - GO</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2">Auxiliar Administrativo</h4>
            <p className="text-sm text-gray-600 mb-3">Rotinas administrativas, controle de estoque e financeiro.</p>
            <span className="text-xs bg-[#2DD4A8]/10 text-[#2DD4A8] px-2 py-1 rounded-full font-medium">Goiânia - GO</span>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl text-center">
          <p className="text-gray-600 mb-4">Envie seu currículo para:</p>
          <a href="mailto:lufitmoda@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2DD4A8] text-gray-900 rounded-lg font-medium hover:bg-[#2DD4A8]/90 transition-colors">
            <Mail className="w-4 h-4" /> lufitmoda@gmail.com
          </a>
          <p className="text-sm text-gray-500 mt-3">Assunto: Vaga - [Nome da Vaga]</p>
        </div>
      </div>
    ),
  },
  privacidade: {
    title: 'Política de Privacidade',
    subtitle: 'Como protegemos seus dados',
    icon: <Lock className="w-6 h-6" />,
    content: (
      <div className="space-y-6 text-gray-600">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">1. Coleta de Dados</h3>
          <p className="text-sm leading-relaxed">
            Coletamos informações pessoais como nome, e-mail, telefone e endereço apenas quando você 
            realiza uma compra ou se cadastra em nosso site. Esses dados são necessários para processar 
            seu pedido e garantir a entrega.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">2. Uso dos Dados</h3>
          <p className="text-sm leading-relaxed">
            Seus dados são utilizados exclusivamente para processar pedidos, enviar atualizações de entrega, 
            e comunicar promoções (caso você autorize). Não vendemos nem compartilhamos seus dados com terceiros 
            para fins comerciais.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">3. Segurança</h3>
          <p className="text-sm leading-relaxed">
            Utilizamos criptografia SSL e outras medidas de segurança para proteger suas informações. 
            Nosso site é 100% seguro para compras online.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">4. Cookies</h3>
          <p className="text-sm leading-relaxed">
            Utilizamos cookies para melhorar sua experiência de navegação, lembrar suas preferências 
            e analisar o tráfego do site. Você pode desativar os cookies nas configurações do navegador.
          </p>
        </div>
      </div>
    ),
  },
  termos: {
    title: 'Termos de Uso',
    subtitle: 'Regras e condições de uso do site',
    icon: <FileText className="w-6 h-6" />,
    content: (
      <div className="space-y-6 text-gray-600">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">1. Aceitação dos Termos</h3>
          <p className="text-sm leading-relaxed">
            Ao acessar e usar o site da LUFIT, você concorda com estes termos de uso. Se não concordar, 
            por favor, não utilize nossos serviços.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">2. Cadastro</h3>
          <p className="text-sm leading-relaxed">
            Para realizar compras, é necessário criar uma conta com informações verdadeiras e atualizadas. 
            Você é responsável por manter a confidencialidade de sua senha.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">3. Preços e Pagamentos</h3>
          <p className="text-sm leading-relaxed">
            Os preços exibidos estão em Reais (R$) e podem ser alterados sem aviso prévio. Aceitamos 
            pagamentos via PIX, cartão de crédito e boleto bancário.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">4. Propriedade Intelectual</h3>
          <p className="text-sm leading-relaxed">
            Todo o conteúdo do site (imagens, textos, logos) é propriedade da LUFIT e está protegido 
            por leis de direitos autorais. É proibida a reprodução sem autorização.
          </p>
        </div>
      </div>
    ),
  },
  atendimento: {
    title: 'Central de Atendimento',
    subtitle: 'Estamos aqui para ajudar você',
    icon: <HelpCircle className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
            <Phone className="w-8 h-8 mb-3" />
            <h4 className="font-bold text-lg mb-1">WhatsApp Vendas</h4>
            <p className="text-green-100 text-sm mb-3">Resposta rápida para pedidos e dúvidas</p>
            <a href="https://wa.me/5562993940034" target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-white text-green-600 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors">
              (62) 99394-0034
            </a>
          </div>
          <div className="bg-gradient-to-br from-[#2DD4A8] to-[#1fa882] p-6 rounded-xl text-white">
            <Phone className="w-8 h-8 mb-3" />
            <h4 className="font-bold text-lg mb-1">WhatsApp Suporte</h4>
            <p className="text-white/80 text-sm mb-3">Atendimento pós-venda e suporte</p>
            <a href="https://wa.me/5562994490177" target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-white text-[#2DD4A8] rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
              (62) 99449-0177
            </a>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Mail className="w-4 h-4 text-[#2DD4A8]" /> E-mail</h4>
          <p className="text-gray-600 text-sm mb-2">Para dúvidas e suporte:</p>
          <a href="mailto:lufitmoda@gmail.com" className="text-[#2DD4A8] font-medium hover:underline">lufitmoda@gmail.com</a>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-[#2DD4A8]" /> Horário de Atendimento</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Segunda a Sexta: 09h - 19h</p>
            <p>Sábado: 09h - 13h</p>
            <p className="text-gray-400 text-xs">Atendimento online via WhatsApp todos os dias</p>
          </div>
        </div>
      </div>
    ),
  },
  trocas: {
    title: 'Trocas e Devoluções',
    subtitle: 'Sua satisfação é garantida',
    icon: <RefreshCw className="w-6 h-6" />,
    content: (
      <div className="space-y-6 text-gray-600">
        <div className="bg-gradient-to-r from-[#2DD4A8]/10 to-transparent p-6 rounded-xl border-l-4 border-[#2DD4A8]">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Política de Trocas - 7 Dias</h3>
          <p className="text-sm leading-relaxed">
            Você tem até 7 dias após o recebimento para solicitar a troca ou devolução de qualquer produto. 
            A peça deve estar em perfeito estado, com etiquetas e sem sinais de uso.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Como Funciona</h3>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><span className="w-6 h-6 bg-[#2DD4A8] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span> Entre em contato pelo WhatsApp (62) 99394-0034</li>
            <li className="flex items-start gap-3"><span className="w-6 h-6 bg-[#2DD4A8] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span> Informe o número do pedido e motivo da troca</li>
            <li className="flex items-start gap-3"><span className="w-6 h-6 bg-[#2DD4A8] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span> Receba as instruções de envio</li>
            <li className="flex items-start gap-3"><span className="w-6 h-6 bg-[#2DD4A8] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span> Envie o produto para nosso endereço</li>
            <li className="flex items-start gap-3"><span className="w-6 h-6 bg-[#2DD4A8] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span> Receba o novo produto ou reembolso</li>
          </ol>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Condições Importantes</h3>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li>O produto deve estar sem sinais de uso, lavagem ou odor</li>
            <li>Etiquetas devem estar intactas e presas à peça</li>
            <li>Embalagem original quando possível</li>
            <li>O custo do frete de devolução é por conta do cliente em caso de desistência</li>
            <li>Em caso de defeito, o frete é por nossa conta</li>
          </ul>
        </div>
      </div>
    ),
  },
  entregas: {
    title: 'Prazos e Entregas',
    subtitle: 'Receba seus produtos em casa',
    icon: <Truck className="w-6 h-6" />,
    content: (
      <div className="space-y-6 text-gray-600">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#2DD4A8]/10 to-transparent p-5 rounded-xl border border-[#2DD4A8]/20 text-center">
            <Truck className="w-8 h-8 text-[#2DD4A8] mx-auto mb-2" />
            <h4 className="font-bold text-gray-900">Envio Rápido</h4>
            <p className="text-sm text-gray-500 mt-1">Postamos em até 24h</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-transparent p-5 rounded-xl border border-blue-200 text-center">
            <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-bold text-gray-900">Todo Brasil</h4>
            <p className="text-sm text-gray-500 mt-1">Entrega nacional</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-transparent p-5 rounded-xl border border-purple-200 text-center">
            <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-bold text-gray-900">Seguro</h4>
            <p className="text-sm text-gray-500 mt-1">Rastreamento completo</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Prazos por Região</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm">Goiânia e Região Metropolitana (GO)</span><span className="font-medium text-sm">2-4 dias úteis</span></div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm">Centro-Oeste (DF, MT, MS)</span><span className="font-medium text-sm">3-6 dias úteis</span></div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm">Sudeste (SP, RJ, MG, ES)</span><span className="font-medium text-sm">4-8 dias úteis</span></div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm">Sul (PR, SC, RS)</span><span className="font-medium text-sm">5-10 dias úteis</span></div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm">Nordeste e Norte</span><span className="font-medium text-sm">7-15 dias úteis</span></div>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-2">Frete Grátis</h4>
          <p className="text-sm text-gray-600">Compras acima de R$ 299,00 têm frete grátis para todo o Brasil. Para compras abaixo desse valor, o frete é calculado no checkout baseado no CEP.</p>
        </div>
      </div>
    ),
  },
  pagamentos: {
    title: 'Formas de Pagamento',
    subtitle: 'Escolha a melhor opção para você',
    icon: <CreditCard className="w-6 h-6" />,
    content: (
      <div className="space-y-6 text-gray-600">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#32BCAD]/10 to-transparent p-5 rounded-xl border border-[#32BCAD]/20 text-center">
            <div className="text-2xl font-black text-[#32BCAD] mb-2">PIX</div>
            <h4 className="font-bold text-gray-900">5% de Desconto</h4>
            <p className="text-sm text-gray-500 mt-1">Pagamento instantâneo</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-transparent p-5 rounded-xl border border-blue-200 text-center">
            <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-bold text-gray-900">Cartão de Crédito</h4>
            <p className="text-sm text-gray-500 mt-1">Até 12x sem juros</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-transparent p-5 rounded-xl border border-gray-200 text-center">
            <Percent className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h4 className="font-bold text-gray-900">Boleto Bancário</h4>
            <p className="text-sm text-gray-500 mt-1">Vencimento em 3 dias</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Cartões Aceitos</h3>
          <p className="text-sm">Visa, Mastercard, American Express, Elo, Hipercard e Diners Club. Parcelamos em até 12x sem juros para compras acima de R$ 100,00.</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-2">Segurança</h4>
          <p className="text-sm">Todas as transações são processadas com criptografia SSL. Seus dados de cartão não são armazenados em nossos servidores.</p>
        </div>
      </div>
    ),
  },
  medidas: {
    title: 'Tabela de Medidas',
    subtitle: 'Encontre o tamanho perfeito',
    icon: <Ruler className="w-6 h-6" />,
    content: (
      <div className="space-y-6 text-gray-600">
        <div className="bg-gradient-to-r from-[#2DD4A8]/10 to-transparent p-6 rounded-xl border-l-4 border-[#2DD4A8]">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Como Medir</h3>
          <p className="text-sm leading-relaxed">Use uma fita métrica e meça diretamente sobre o corpo, sem apertar. Para melhor resultado, peça ajuda de alguém.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#2DD4A8] text-white">
                <th className="px-4 py-3 text-left rounded-tl-lg">Tamanho</th>
                <th className="px-4 py-3 text-center">Busto (cm)</th>
                <th className="px-4 py-3 text-center">Cintura (cm)</th>
                <th className="px-4 py-3 text-center rounded-tr-lg">Quadril (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 bg-white"><td className="px-4 py-3 font-medium">PP</td><td className="px-4 py-3 text-center">78-82</td><td className="px-4 py-3 text-center">60-64</td><td className="px-4 py-3 text-center">86-90</td></tr>
              <tr className="border-b border-gray-50 bg-gray-50"><td className="px-4 py-3 font-medium">P</td><td className="px-4 py-3 text-center">82-86</td><td className="px-4 py-3 text-center">64-68</td><td className="px-4 py-3 text-center">90-94</td></tr>
              <tr className="border-b border-gray-50 bg-white"><td className="px-4 py-3 font-medium">M</td><td className="px-4 py-3 text-center">86-90</td><td className="px-4 py-3 text-center">68-72</td><td className="px-4 py-3 text-center">94-98</td></tr>
              <tr className="border-b border-gray-50 bg-gray-50"><td className="px-4 py-3 font-medium">G</td><td className="px-4 py-3 text-center">90-96</td><td className="px-4 py-3 text-center">72-78</td><td className="px-4 py-3 text-center">98-104</td></tr>
              <tr className="bg-white"><td className="px-4 py-3 font-medium rounded-bl-lg">GG</td><td className="px-4 py-3 text-center">96-102</td><td className="px-4 py-3 text-center">78-84</td><td className="px-4 py-3 text-center rounded-br-lg">104-110</td></tr>
            </tbody>
          </table>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <p className="text-sm text-yellow-800"><strong>Dica:</strong> Nossas peças de fitness possuem alta compressão. Se estiver entre dois tamanhos, recomendamos escolher o maior para maior conforto.</p>
        </div>
      </div>
    ),
  },
  atacado: {
    title: 'Atacado',
    subtitle: 'Compre em quantidade com preços especiais',
    icon: <Percent className="w-6 h-6" />,
    content: (
      <div className="space-y-6 text-gray-600">
        <div className="bg-gradient-to-r from-[#2DD4A8]/10 to-transparent p-6 rounded-xl border-l-4 border-[#2DD4A8]">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Vendas no Atacado</h3>
          <p className="text-sm leading-relaxed">
            Se você tem uma loja ou revende moda fitness, temos condições especiais para compras no atacado. 
            Descontos progressivos conforme a quantidade.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
            <h4 className="font-bold text-gray-900 text-lg">10+ peças</h4>
            <p className="text-[#2DD4A8] font-black text-2xl my-2">15% OFF</p>
            <p className="text-xs text-gray-500">Desconto no atacado</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
            <h4 className="font-bold text-gray-900 text-lg">30+ peças</h4>
            <p className="text-[#2DD4A8] font-black text-2xl my-2">25% OFF</p>
            <p className="text-xs text-gray-500">Desconto no atacado</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
            <h4 className="font-bold text-gray-900 text-lg">50+ peças</h4>
            <p className="text-[#2DD4A8] font-black text-2xl my-2">35% OFF</p>
            <p className="text-xs text-gray-500">Desconto no atacado</p>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl text-center">
          <p className="text-gray-600 mb-4">Para fazer um pedido no atacado, entre em contato:</p>
          <a href="https://wa.me/5562993940034" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
            <Phone className="w-4 h-4" /> WhatsApp (62) 99394-0034
          </a>
        </div>
      </div>
    ),
  },
};

export default function ContentPage({ page }: ContentPageProps) {
  const pageData = pages[page] || pages['sobre'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#2DD4A8] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{pageData.title}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#2DD4A8]/10 rounded-xl flex items-center justify-center text-[#2DD4A8]">
              {pageData.icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pageData.title}</h1>
              <p className="text-gray-500 text-sm">{pageData.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          {pageData.content}
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#2DD4A8] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para a Home
          </Link>
        </div>
      </div>
    </div>
  );
}
