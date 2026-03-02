import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SecurityDayPoll } from "@/components/SecurityDayPoll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  MapPin,
  Phone,
  Mail,
  Download,
  ExternalLink,
  Clock,
  MapPinIcon,
  Calendar,
  Briefcase,
  UtensilsCrossed,
  Plane,
  AlertCircle,
  CheckCircle2,
  UserSquare2
} from "lucide-react";
import { TravelProgressBar } from "@/components/TravelProgressBar";
import { ProgramacaoWizard } from "@/components/ProgramacaoWizard";

/**
 * Design: Institucional Elegante com Modernidade Sutil
 * Paleta: Azul Marinho (#00375e), Branco (#ffffff), Dourado (#e1ad31)
 * Tipografia: Montserrat (títulos), Open Sans (corpo)
 */

export default function Home() {
  const [activeTab, setActiveTab] = useState("consespd");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const progressSteps = [
    { id: 'checkin', label: 'Check-in', status: 'completed' as const },
    { id: 'abertura', label: 'Abertura', status: 'current' as const },
    { id: 'programacao', label: 'Programação', status: 'upcoming' as const },
    { id: 'contas', label: 'Prestação de Contas', status: 'upcoming' as const },
  ];

  return (
    <div className="min-h-screen bg-site text-foreground font-sans selection:bg-accent selection:text-primary">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 header-gradient shadow-lg">
        <div className="container py-4 flex items-center gap-8">
          {/* Logo + barra amarela */}
          <div className="flex items-center gap-3 shrink-0">
            <img src="/fnsp.png" alt="FNSP" className="h-20 w-auto object-contain" />
            <div className="w-1.5 h-10 bg-accent rounded-full" aria-hidden="true"></div>
          </div>

          {/* Desktop Nav — alinhado à esquerda */}
          <nav className="hidden md:flex gap-8" aria-label="Navegação principal">
            <a href="#programacao" className="text-white/80 hover:text-accent font-medium transition-all duration-300">Programação</a>
            <a href="#passagens" className="text-white/80 hover:text-accent font-medium transition-all duration-300">Diárias</a>
            <a href="#contas" className="text-white/80 hover:text-accent font-medium transition-all duration-300">Prestação</a>
            <a href="#roteiro" className="text-white/80 hover:text-accent font-medium transition-all duration-300">Roteiro</a>
            <a href="#regras" className="text-white/80 hover:text-accent font-medium transition-all duration-300">Regras</a>
            <a href="#contato" className="text-white/80 hover:text-accent font-medium transition-all duration-300">Contato</a>
            <a href="https://drive.google.com/drive/folders/1BvwogQt_T3VH2T6YqbSwqawYB4zmXP8h?usp=drive_link" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent font-medium transition-all duration-300">Documentos</a>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-all ml-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <nav id="mobile-nav" className="md:hidden border-t border-white/10 px-4 pb-4" aria-label="Navegação mobile">
            {[
              { href: "#programacao", label: "Programação" },
              { href: "#passagens", label: "Diárias" },
              { href: "#contas", label: "Prestação de Contas" },
              { href: "#roteiro", label: "Roteiro" },
              { href: "#regras", label: "Regras" },
              { href: "#contato", label: "Contato" },
              { href: "https://drive.google.com/drive/folders/1BvwogQt_T3VH2T6YqbSwqawYB4zmXP8h?usp=drive_link", label: "Documentos", external: true },
            ].map(({ href, label, external }) => (
              <a
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-white/80 hover:text-accent font-medium border-b border-white/5 transition-all"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="pb-24">


        {/* Hero Section */}
        <section className="relative h-[500px] flex items-center overflow-hidden">
          {/* Background Overlay Wrapper */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-primary/70 z-10"></div>
            <img
              src="/cicb.jpeg"
              alt="CICB - Brasília"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="container relative z-20">
            <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent font-bold rounded-full text-base tracking-widest uppercase">
                  Brasília • 03-06 Março
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                  Encontro Nacional <br />
                  <span className="text-accent underline decoration-white/20 underline-offset-8">ComprasSusp 2026</span>
                </h1>
                <p className="text-base sm:text-xl text-white/80 leading-relaxed font-light">
                  A excelência na gestão de contratações e aquisições
                  <span className="hidden sm:inline"><br /></span>
                  {" "}fortalecendo a segurança pública em todo o Brasil.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span className="font-semibold text-base sm:text-lg">CICB - Brasília/DF</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild className="h-11 sm:h-14 px-6 sm:px-10 text-base sm:text-lg shadow-xl bg-accent text-primary font-bold hover:bg-accent/90 rounded-md transition-all">
                  <a
                    href="https://www.google.com/maps/place/Centro+Internacional+de+Conven%C3%A7%C3%B5es+do+Brasil/@-15.812877,-47.832388,12z/data=!4m8!3m7!1s0x935a235b9cbb04f5:0x891cb2fcc1ef260!8m2!3d-15.8156846!4d-47.8447472!9m1!1b1!16s%2Fg%2F1q5gppnwh?hl=pt-BR&entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ver localização do CICB no Google Maps (abre em nova janela)"
                  >
                    <MapPinIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                    Localização CICB
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Programação Section */}
        <section id="programacao" className="container pt-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-2 h-10 bg-accent rounded-full"></div>
            <div>
              <h2 className="text-4xl font-bold text-primary">Programação</h2>
              <p className="text-primary/60 font-medium">Cronograma detalhado por grupo de trabalho</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <ProgramacaoWizard />
          </div>
        </section>

        {/* Passagens e Diárias Section */}
        <section id="passagens" className="container pt-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-2 h-10 bg-accent rounded-full"></div>
            <div>
              <h2 className="text-4xl font-bold text-primary">Passagens e Diárias</h2>
              <p className="text-primary/60 font-medium">Informações essenciais para sua viagem</p>
            </div>
          </div>

          <Card className="card-premium">
            <CardContent className="p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-sm text-primary font-bold uppercase tracking-wider mb-2">Valor da Diária</p>
                  <p className="text-3xl font-bold text-primary">R$ 425,00</p>
                </div>
                <div className="p-6 bg-accent/10 rounded-xl border border-accent/20">
                  <p className="text-sm text-primary font-bold uppercase tracking-wider mb-2">Adicional Embarque</p>
                  <p className="text-3xl font-bold text-primary">R$ 95,00</p>
                  <p className="text-xs text-primary/60 mt-1">Taxa única por trecho</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </section>

        {/* Prestação de Contas Section */}
        <section id="contas" className="container pt-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-2 h-10 bg-accent rounded-full"></div>
            <div>
              <h2 className="text-4xl font-bold text-primary">Prestação de Contas</h2>
              <p className="text-primary/60 font-medium">Informações obrigatórias pós-evento</p>
            </div>
          </div>

          <Card className="card-premium border-accent/30 bg-accent/20">
            <CardContent className="p-6 sm:p-12 space-y-8">
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-center max-w-3xl mx-auto">
                A entrega da documentação é <span className="font-bold text-black underline decoration-accent/30 decoration-4">imprescindível</span> para a regularização da sua viagem no sistema.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 p-5 sm:p-8 bg-white rounded-2xl shadow-xl shadow-primary/5 border border-primary/5 group hover:border-accent/30 transition-all">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-black text-xl sm:text-2xl font-black group-hover:bg-accent group-hover:text-black transition-all" aria-hidden="true">
                    1
                  </div>
                  <div>
                    <span className="text-base sm:text-xl font-bold text-gray-800 block">Relatório de Viagem</span>
                    <span className="text-sm text-gray-500">Documento base detalhado</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 sm:p-8 bg-white rounded-2xl shadow-xl shadow-primary/5 border border-primary/5 group hover:border-accent/30 transition-all">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-black text-xl sm:text-2xl font-black group-hover:bg-accent group-hover:text-black transition-all" aria-hidden="true">
                    2
                  </div>
                  <div>
                    <span className="text-base sm:text-xl font-bold text-gray-800 block">Canhotos de Embarque</span>
                    <span className="text-sm text-gray-500">Comprovantes originais</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-8 border-t border-accent/10">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                  PRAZO DE ENTREGA
                </div>
                <p className="text-base sm:text-lg font-semibold text-black text-center">
                  Os Cartões de Embarque (Ida e volta) e Relatório de Viagem (Assinado) devem ser entregues até a data de retorno.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Traje Section */}
        <section id="regras" className="container pt-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-2 h-10 bg-accent rounded-full"></div>
            <div>
              <h2 className="text-4xl font-bold text-primary">Traje</h2>
              <p className="text-primary/60 font-medium">Conduta de vestimenta</p>
            </div>
          </div>

          <Card className="card-premium">
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                À critério de cada instituição integrante do Sistema Único de Segurança Pública.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Security Day Poll Section */}
        {/*
        <section id="security-day" className="container pt-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-2 h-10 bg-accent rounded-full"></div>
            <div>
              <h2 className="text-4xl font-bold text-primary">Security Day</h2>
              <p className="text-primary/60 font-medium">Clique em 8 empresas de seu interesse</p>
            </div>
          </div>
          <Card className="card-premium">
            <CardContent className="p-6 sm:p-10">
              <SecurityDayPoll />
            </CardContent>
          </Card>
        </section>
        */}

        {/* Roteiro Cultural Section */}
        <section id="roteiro" className="container pt-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-2 h-10 bg-accent rounded-full"></div>
            <div>
              <h2 className="text-4xl font-bold text-primary">Brasília: Guia Rápido</h2>
              <p className="text-gray-500 font-medium">Cultura e Gastronomia na Capital Federal</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="card-premium">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-primary">Culinária</CardTitle>
                    <CardDescription>Experiências gastronômicas recomendadas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary">Setor de Clubes Sul</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Localizado às margens do Lago Paranoá, oferece restaurantes sofisticados com carnes, frutos do mar e culinária contemporânea.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-bold text-primary">Pontão do Lago Sul</p>
                        <p className="text-xs text-gray-500">O maior centro de lazer e gastronomia da capital, ideal para um jantar com vista para a Ponte JK.</p>
                        <a href="https://maps.app.goo.gl/vP3Zc6u8zWp8N8yA8" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
                          <MapPin className="w-3 h-3" /> Ver no Maps
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-bold text-primary">Shopping Pier 21</p>
                        <p className="text-xs text-gray-500">St. de Clubes Esportivos Sul Trecho 2 - Asa Sul, Brasília - DF</p>
                        <a href="https://maps.app.goo.gl/9RzG5aJ8Bf1Z2rJ79" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
                          <MapPin className="w-3 h-3" /> Ver no Maps
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-bold text-primary">Açougue do Berg</p>
                        <p className="text-xs text-gray-500">St. de Clubes Esportivos Sul Trecho 2 Ao lado da ASBAC conjunto 31</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=Açougue+do+Berg+Setor+de+Clubes+Esportivos+Sul+Trecho+2+Brasília" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
                          <MapPin className="w-3 h-3" /> Ver no Maps
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-bold text-primary">Coco Bambu Lado Sul</p>
                        <p className="text-xs text-gray-500">St. de Clubes Esportivos Sul Trecho 2 Ícone Parque Conjunto 36</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=Coco+Bambu+Lago+Sul+SCES+Trecho+2+Conjunto+36+Brasília" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
                          <MapPin className="w-3 h-3" /> Ver no Maps
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-bold text-primary">Fogo de Chão Brasília</p>
                        <p className="text-xs text-gray-500">ST DE CLUBES ESPORTIVOS SUL, Asa Sul Trecho 2 2/11</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=Fogo+de+Chão+Brasília+Setor+de+Clubes+Esportivos+Sul+Trecho+2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
                          <MapPin className="w-3 h-3" /> Ver no Maps
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-bold text-primary">Nau Frutos do Mar</p>
                        <p className="text-xs text-gray-500">Setor de Clubes Esportivos Sul, Asa Sul Trecho 2</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=Nau+Frutos+do+Mar+Brasília+SCES+Trecho+2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
                          <MapPin className="w-3 h-3" /> Ver no Maps
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-bold text-primary">Mangai Lago</p>
                        <p className="text-xs text-gray-500">SCE Sul, s/n - Lote 2, Asa Sul, Brasília - DF</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=Mangai+Lago+Brasília+SCES+Trecho+2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
                          <MapPin className="w-3 h-3" /> Ver no Maps
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-bold text-primary">Galeteria Beira Lago</p>
                        <p className="text-xs text-gray-500">SCE Sul, Trecho 2, Conjunto 33 - Centro, Brasília - DF</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=Galeteria+Beira+Lago+SCES+Trecho+2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
                          <MapPin className="w-3 h-3" /> Ver no Maps
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-primary">Cultura</CardTitle>
                    <CardDescription>Pontos turísticos essenciais</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <div>
                      <p className="font-bold text-primary">Praça dos Três Poderes</p>
                      <p className="text-xs text-gray-500">Centro político e arquitetura de Niemeyer</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <div>
                      <p className="font-bold text-primary">Catedral Metropolitana</p>
                      <p className="text-xs text-gray-500">Design icônico e vitrais impressionantes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <div>
                      <p className="font-bold text-primary">Ermida Dom Bosco</p>
                      <p className="text-xs text-gray-500">Melhor pôr do sol de Brasília</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contato Section */}
        <section id="contato" className="container pt-24">
          <Card className="bg-primary overflow-hidden border-none shadow-2xl">
            <div>
              <div className="p-6 sm:p-12 lg:p-16 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl sm:text-4xl font-bold text-white">Precisa de Suporte?</h2>
                  <p className="text-white/70 text-base sm:text-lg">
                    Estamos à disposição para ajudar com qualquer dúvida sobre o evento ou programação.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-accent font-bold">
                      <Mail className="w-5 h-5" aria-hidden="true" />
                      E-MAIL
                    </div>
                    <a href="mailto:comprassusp@mj.gov.br" className="text-base sm:text-xl text-white font-medium hover:text-accent transition-all break-all">
                      comprassusp@mj.gov.br
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-accent font-bold">
                      <Phone className="w-5 h-5" aria-hidden="true" />
                      TELEFONE
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1 text-base sm:text-xl text-white font-medium">
                        <p>(61) 2025-3008</p>
                        <p>(61) 2025-9796</p>
                      </div>
                      <a
                        href="https://wa.me/5561981773636"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-2 px-4 bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg group hover:bg-[#25D366]/20 transition-all w-fit"
                        aria-label="WhatsApp Suporte: (61) 98177-3636 (abre em nova janela)"
                      >
                        <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03c0 2.123.554 4.197 1.607 6.037L0 24l6.105-1.602a11.834 11.834 0 005.937 1.583h.005c6.635 0 12.03-5.394 12.033-12.031 0-3.212-1.25-6.231-3.518-8.498"></path>
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[#25D366] font-bold text-lg leading-tight">(61) 98177-3636</span>
                          <span className="text-white/50 text-[10px] uppercase tracking-wider font-bold">WhatsApp Suporte</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>


              </div>


            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h3 className="text-lg font-bold text-primary tracking-tight">ComprasSusp 2026</h3>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">
                O fortalecimento da Segurança Pública através da governança e inovação em aquisições.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Organização</p>
              <p className="text-base font-semibold text-primary">SENASP - Secretaria Nacional de Segurança Pública</p>
              <p className="text-xs text-gray-500">Governo Federal do Brasil</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-medium">
              © 2026 Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-xs text-gray-500 font-medium">
              <span className="hover:text-primary cursor-default">Privacidade</span>
              <span className="hover:text-primary cursor-default">Termos de Uso</span>
              <span className="hover:text-primary cursor-default">Acessibilidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}
