import { Link } from 'react-router-dom';
import { Headphones, MessageCircle, RotateCcw, FileText, Phone, Mail, Clock, MapPin, ChevronRight, Instagram } from 'lucide-react';

const topics = [
  {
    icon: MessageCircle,
    title: 'Fale Conosco',
    description: 'Entre em contato via WhatsApp ou e-mail',
    action: 'Iniciar conversa',
    link: 'https://wa.me/5562993940034',
    external: true,
  },
  {
    icon: RotateCcw,
    title: 'Trocas e Devoluções',
    description: 'Prazo de 7 dias para troca ou devolução',
    action: 'Ver política',
    link: '/trocas',
  },
  {
    icon: FileText,
    title: 'Perguntas Frequentes',
    description: 'Encontre respostas para suas dúvidas',
    action: 'Ver FAQ',
    link: '#faq',
  },
  {
    icon: Headphones,
    title: 'Central de Ajuda',
    description: 'Atendimento de segunda a sábado',
    action: 'Saiba mais',
    link: '#contato',
  },
];

const faqs = [
  {
    question: 'Qual o prazo de entrega?',
    answer:
      'O prazo de entrega varia de acordo com sua localização. Para Goiânia e região metropolitana, o prazo médio é de 1-3 dias úteis. Para outras capitais, de 3-7 dias úteis. Você pode calcular o frete exato na página do produto ou no carrinho.',
  },
  {
    question: 'Como funciona a troca?',
    answer:
      'Você tem até 7 dias após o recebimento para solicitar a troca. A peça deve estar com a etiqueta e sem sinais de uso. Entre em contato pelo WhatsApp (62) 99394-0034 para iniciar o processo.',
  },
  {
    question: 'Quais as formas de pagamento?',
    answer:
      'Aceitamos cartão de crédito (parcelamos em até 12x), Pix (com 10% de desconto), boleto bancário e cartão de débito.',
  },
  {
    question: 'Como saber meu tamanho?',
    answer:
      'Temos uma tabela de medidas completa em cada página de produto. Clique no link "Tabela de medidas" ao lado dos tamanhos disponíveis. Se ainda tiver dúvidas, nosso time de atendimento pode ajudar pelo WhatsApp.',
  },
  {
    question: 'A LUFIT tem loja física?',
    answer:
      'Sim! Nossa loja física fica em Goiânia, GO. Endereço: Av. Goiânia, Qd. 73 - Lt 10 - Jardim Guanabara I. Horário: Seg a Sex 09h-19h, Sáb 09h-13h.',
  },
];

export default function AtendimentoPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Central de Atendimento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">
            CENTRAL DE ATENDIMENTO
          </h1>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {topics.map(topic => (
            <div
              key={topic.title}
              className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-lufit-teal/10 rounded-lg flex items-center justify-center mb-4">
                <topic.icon className="w-6 h-6 text-lufit-teal" />
              </div>
              <h3 className="font-bold text-lufit-dark mb-1">{topic.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{topic.description}</p>
              {topic.external ? (
                <a
                  href={topic.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-lufit-teal hover:underline"
                >
                  {topic.action} <ChevronRight className="w-4 h-4" />
                </a>
              ) : (
                <Link
                  to={topic.link}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-lufit-teal hover:underline"
                >
                  {topic.action} <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div id="faq" className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark mb-6">
            PERGUNTAS FREQUENTES
          </h2>
          <div className="bg-white rounded-xl border divide-y">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-lufit-dark pr-4">{faq.question}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div id="contato" className="bg-lufit-dark rounded-xl p-6 sm:p-10 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading mb-4">
                FALE COM A GENTE
              </h2>
              <p className="text-gray-400 mb-6">
                Nossa equipe está pronta para atender você. Entre em contato pelos canais abaixo.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-lufit-teal" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Vendas</div>
                    <div className="font-medium">(62) 99394-0034 | (62) 99449-0177</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-lufit-teal" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Contato</div>
                    <div className="font-medium">(62) 99364-4999</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-lufit-teal" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">E-mail</div>
                    <div className="font-medium">lufitmoda@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-lufit-teal" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Instagram</div>
                    <a
                      href="https://www.instagram.com/lufitmodaa/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-lufit-teal transition-colors"
                    >
                      @lufitmodaa
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">LOJA FÍSICA</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-lufit-teal mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300">
                      Av. Goiânia, Qd. 73 - Lt 10
                    </p>
                    <p className="text-sm text-gray-300">
                      Jardim Guanabara I, Goiânia - GO
                    </p>
                    <p className="text-sm text-gray-300">CEP: 74675-320</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-lufit-teal mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300">Segunda a Sexta: 09:00 - 19:00</p>
                    <p className="text-sm text-gray-300">Sábado: 09:00 - 13:00</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <iframe
                  title="Loja LUFIT"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3821.755756060395!2d-49.3115!3d-16.6869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ef36356733b77%3A0x7eb8afff26d98d2b!2sLUFIT+Moda+Fitness!5e0!3m2!1spt-BR!2sbr!4v1715100000000!5m2!1spt-BR!2sbr"
                  className="w-full h-48 rounded-lg border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
