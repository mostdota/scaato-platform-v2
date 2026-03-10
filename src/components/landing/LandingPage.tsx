'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Zap, Shield, TrendingUp, ChevronRight, ArrowRight,
  Check, Users, Clock, Star, Menu, X, Bike,
  Battery, Gauge, Wind, Leaf, CreditCard, FileCheck,
  Play, ChevronDown,
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Como Funciona', href: '/como-funciona' },
  { label: 'Especificações', href: '#specs' },
  { label: 'Investimento', href: '#pricing' },
  { label: 'Sobre', href: '/sobre' },
]

const STEPS = [
  {
    step: '01',
    icon: Users,
    title: 'Cadastre-se',
    desc: 'Crie sua conta em 5 minutos. Preencha seus dados e escolha sua scooter.',
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Realize o Pagamento',
    desc: 'Pague via PIX, boleto ou cartão. Confirmação instantânea.',
  },
  {
    step: '03',
    icon: FileCheck,
    title: 'Assine o Contrato',
    desc: 'Contrato digital gerado automaticamente. Assine pelo celular ou computador.',
  },
  {
    step: '04',
    icon: Bike,
    title: 'Receba sua Scooter',
    desc: 'Em até 15 dias úteis, sua scooter é entregue em seu endereço.',
  },
]

const BENEFITS = [
  { icon: Zap,       title: 'Sem Burocracia',     desc: 'Processo 100% digital. Do cadastro à entrega, tudo online.' },
  { icon: Shield,    title: 'Pagamento Seguro',    desc: 'Integração Asaas certificada. PIX, boleto ou cartão.' },
  { icon: FileCheck, title: 'Contrato Digital',    desc: 'Assinatura eletrônica com validade jurídica via Clicksign.' },
  { icon: TrendingUp,title: 'Suporte Completo',    desc: 'Equipe disponível para auxiliar em todas as etapas.' },
  { icon: Leaf,      title: 'Zero Emissões',       desc: 'Contribua para uma mobilidade mais limpa e sustentável.' },
  { icon: Clock,     title: 'Entrega Rápida',      desc: 'Receba sua scooter em até 15 dias úteis após confirmação.' },
]

const SPECS = [
  { icon: Gauge,   label: 'Velocidade Máx',  value: '65 km/h' },
  { icon: Battery, label: 'Autonomia',        value: '100 km' },
  { icon: Zap,     label: 'Motor',            value: '2000 W' },
  { icon: Wind,    label: 'Tempo de Carga',   value: '4–6 h' },
]

const TESTIMONIALS = [
  { name: 'Rodrigo Mendes', role: 'Entregador', text: 'Processo todo online e sem dor de cabeça. Recebi minha scooter dentro do prazo!', stars: 5 },
  { name: 'Camila Souza',   role: 'Estudante',  text: 'A assinatura digital foi super fácil. Recomendo para qualquer um que queira mobilidade.', stars: 5 },
  { name: 'Lucas Ferreira', role: 'Motoboy',    text: 'Economizo muito em combustível. O investimento se pagou em menos de 3 meses.', stars: 5 },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1e1e1e]' : ''
      }`}>
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#f0f0f0]">
              SCAATO
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href}
                className="px-4 py-2 text-sm text-[#888] hover:text-[#f0f0f0] rounded-lg hover:bg-[#1a1a1a] transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost text-sm">Entrar</Link>
            <Link href="/cadastro" className="btn btn-primary text-sm">
              Adquirir Scooter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button className="md:hidden p-2 text-[#888]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0a0a0a] border-b border-[#1e1e1e] px-6 pb-4"
            >
              {NAV_LINKS.map(link => (
                <Link key={link.label} href={link.href}
                  className="block py-3 text-sm text-[#888] hover:text-[#f0f0f0] border-b border-[#1a1a1a]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4">
                <Link href="/login" className="btn btn-secondary w-full">Entrar</Link>
                <Link href="/cadastro" className="btn btn-primary w-full">Adquirir Scooter</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1DB954]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#1DB954]/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-[#1DB954] uppercase tracking-widest">
              Nova geração de mobilidade urbana
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.92] mb-6"
          >
            Sua scooter
            <br />
            <span className="text-gradient">elétrica</span>
            <br />
            do futuro
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[#888] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            100% digital. Processo simplificado. Pagamento seguro.
            Receba sua scooter elétrica em até 15 dias úteis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/cadastro" className="btn btn-primary btn-lg group">
              Adquirir Agora
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/simulador" className="btn btn-secondary btn-lg">
              <Play className="w-4 h-4" />
              Ver Demonstração
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            {[
              { value: '100km', label: 'Autonomia' },
              { value: '65km/h', label: 'Vel. Máxima' },
              { value: '15 dias', label: 'Entrega' },
              { value: '12 meses', label: 'Garantia' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[#f0f0f0] font-mono">{stat.value}</div>
                <div className="text-xs text-[#666] uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#444]"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 relative" id="como-funciona">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[#1DB954] uppercase tracking-[0.2em] mb-3">Processo</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Simples em 4 etapas
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative group"
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#2a2a2a] to-transparent z-0" />
                )}

                <div className="card p-6 relative z-10 hover:border-[#1DB954]/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1DB954]/10 flex items-center justify-center group-hover:bg-[#1DB954]/20 transition-colors">
                      <step.icon className="w-5 h-5 text-[#1DB954]" />
                    </div>
                    <span className="text-4xl font-bold text-[#1a1a1a] font-mono">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-[#f0f0f0] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECS ── */}
      <section className="py-20 bg-[#0d0d0d] border-y border-[#1a1a1a]" id="specs">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-[#1DB954] uppercase tracking-[0.2em] mb-3">Scooter Urban 100</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                Performance
                <br />
                que surpreende
              </h2>
              <p className="text-[#666] leading-relaxed mb-8">
                Motor de 2000W com torque instantâneo, bateria de alta capacidade
                e tecnologia de regeneração de energia. Perfeita para o dia a dia urbano.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {SPECS.map(spec => (
                  <div key={spec.label} className="card p-4">
                    <spec.icon className="w-5 h-5 text-[#1DB954] mb-2" />
                    <div className="text-xl font-bold font-mono">{spec.value}</div>
                    <div className="text-xs text-[#666] mt-0.5">{spec.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="card p-8 text-center">
                <div className="w-24 h-24 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
                  <Bike className="w-12 h-12 text-[#1DB954]" />
                </div>
                <div className="text-5xl font-bold text-[#1DB954] font-mono mb-1">R$ 4.500</div>
                <div className="text-[#666] text-sm mb-6">Valor total da scooter</div>
                <Link href="/cadastro" className="btn btn-primary w-full">
                  Adquirir Agora <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {/* Glow */}
              <div className="absolute inset-0 bg-[#1DB954]/5 rounded-2xl blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[#1DB954] uppercase tracking-[0.2em] mb-3">Vantagens</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Por que escolher a SCAATO?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-hover p-6 group"
              >
                <div className="w-10 h-10 bg-[#1DB954]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1DB954]/20 transition-colors">
                  <b.icon className="w-5 h-5 text-[#1DB954]" />
                </div>
                <h3 className="font-semibold text-[#f0f0f0] mb-2">{b.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-[#0d0d0d] border-y border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#1DB954] uppercase tracking-[0.2em] mb-3">Depoimentos</p>
            <h2 className="text-3xl font-bold tracking-tighter">O que dizem nossos clientes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#1DB954] fill-[#1DB954]" />
                  ))}
                </div>
                <p className="text-[#888] text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-[#555]">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#1DB954]/8 rounded-full blur-[100px]" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              Pronto para
              <br />
              <span className="text-gradient">decolar?</span>
            </h2>
            <p className="text-[#666] text-lg mb-10">
              Faça seu cadastro agora e receba sua scooter elétrica em até 15 dias úteis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cadastro" className="btn btn-primary btn-lg group">
                Começar Agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                Já tenho conta
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 mt-10 text-xs text-[#555]">
              {['100% Digital', 'Pagamento Seguro', 'Garantia 12 meses'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1a1a1a] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1DB954] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold text-lg tracking-tight">SCAATO</span>
            </div>
            <div className="flex gap-6 text-sm text-[#555]">
              <Link href="/legal" className="hover:text-[#888] transition-colors">Legal</Link>
              <Link href="/suporte" className="hover:text-[#888] transition-colors">Suporte</Link>
              <Link href="/sobre" className="hover:text-[#888] transition-colors">Sobre</Link>
              <Link href="/como-funciona" className="hover:text-[#888] transition-colors">Como funciona</Link>
            </div>
            <p className="text-xs text-[#444]">© {new Date().getFullYear()} SCAATO. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
