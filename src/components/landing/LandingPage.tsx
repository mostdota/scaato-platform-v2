'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ArrowRight, Zap, Shield, Clock, ChevronDown, Play } from 'lucide-react'

// ── MARQUEE STRIP ──────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'URBAN 100', 'MOBILIDADE ELÉTRICA', 'ENTREGA GARANTIDA', '2000W',
  '100KM AUTONOMIA', 'ZERO EMISSÃO', 'URBAN 100', 'DESIGN ITALIANO',
  'MOBILIDADE ELÉTRICA', 'ENTREGA GARANTIDA', '2000W', '100KM AUTONOMIA',
]

function MarqueeStrip({ reverse = false }) {
  return (
    <div className="overflow-hidden py-3 border-y" style={{ borderColor: 'var(--border)' }}>
      <div
        className={`flex gap-8 whitespace-nowrap ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{
          animation: `marquee ${reverse ? 'reverse' : 'normal'} 25s linear infinite`,
        }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-8 text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
            <span style={{ color: 'var(--blue)' }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── STAT ──────────────────────────────────────────────────────
function Stat({ num, label, delay = 0 }: { num: string; label: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6 }}
      className="text-center"
    >
      <div className="font-display text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--white)' }}>{num}</div>
      <div className="text-xs tracking-widest uppercase mt-2" style={{ color: 'var(--gray)' }}>{label}</div>
    </motion.div>
  )
}

// ── STEP CARD ─────────────────────────────────────────────────
function StepCard({ number, title, desc, delay = 0 }: { number: string; title: string; desc: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div
        className="rounded-2xl p-8 h-full transition-all duration-500"
        style={{
          background: 'rgba(28,28,30,0.6)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="text-8xl font-display mb-6 leading-none"
          style={{ fontFamily: 'var(--font-display)', color: 'rgba(10,132,255,0.15)' }}
        >
          {number}
        </div>
        <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--white)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(90deg, transparent, var(--blue), transparent)' }}
        />
      </div>
    </motion.div>
  )
}

// ── SPEC ROW ──────────────────────────────────────────────────
function SpecRow({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center justify-between py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: 'var(--white)' }}>{value}</span>
    </motion.div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const [videoError, setVideoError] = useState(false)

  return (
    <div ref={containerRef} style={{ background: 'var(--black)' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
        style={{
          background: 'rgba(5,5,5,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--blue)' }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span
            className="text-base font-semibold tracking-wider"
            style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.1em' }}
          >
            SCAATO
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Urban 100', 'Como Funciona', 'Scooter', 'Contato'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-xs font-medium tracking-widest uppercase transition-colors"
              style={{ color: 'var(--gray)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray)')}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost text-xs tracking-wider">
            Entrar
          </Link>
          <Link href="/cadastro" className="btn btn-primary text-xs tracking-wider">
            Reservar Vaga
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        id="urban-100"
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(10,132,255,0.08) 0%, transparent 70%)',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 pt-20"
        >
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-12"
            style={{
              background: 'rgba(10,132,255,0.1)',
              border: '1px solid rgba(10,132,255,0.2)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--blue)' }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--blue)' }}>
              Urban 100 — Vagas Abertas
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="hero-title mb-6"
          >
            SCAATO
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl mb-2 font-light"
            style={{ color: 'rgba(245,247,250,0.6)', letterSpacing: '0.05em' }}
          >
            Sua mobilidade inteligente.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-sm mb-12 font-light tracking-wider"
            style={{ color: 'var(--gray)' }}
          >
            Mobilidade elétrica com engenharia de precisão.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/cadastro" className="btn btn-primary gap-2 px-8 py-4 text-sm">
              Entrar no Urban 100
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#como-funciona" className="btn btn-outline gap-2 px-8 py-4 text-sm">
              <Play className="w-4 h-4" />
              Como Funciona
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: 'var(--gray)' }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <Stat num="100" label="Participantes" delay={0} />
          <Stat num="2000W" label="Motor Elétrico" delay={0.1} />
          <Stat num="100km" label="Autonomia" delay={0.2} />
          <Stat num="R$467" label="Por Mês" delay={0.3} />
        </div>
      </section>

      {/* ── MARQUEE REVERSE ──────────────────────────────────── */}
      <MarqueeStrip reverse />

      {/* ── COMO FUNCIONA ─────────────────────────────────────── */}
      <section id="como-funciona" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-label mb-4"
            >
              Modelo Urban 100
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-title"
            >
              Como<br />Funciona
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              number="01"
              title="Entre no Grupo"
              desc="Garanta sua vaga no Urban 100. 100 participantes. Cada um contribui com R$467/mês. Sem sorteio — a ordem é por entrada."
              delay={0}
            />
            <StepCard
              number="02"
              title="Contribua Mensalmente"
              desc="A partir do 2º mês o caixa já permite as primeiras entregas. Modelo transparente e previsível — você sabe exatamente quando recebe."
              delay={0.1}
            />
            <StepCard
              number="03"
              title="Receba sua Scooter"
              desc="Scooter elétrica Urban 100 com motor 2000W, 100km de autonomia, entregue direto para você com contrato digital assinado."
              delay={0.2}
            />
          </div>

          {/* Timeline visual */}
          <div className="mt-20 rounded-2xl p-8 md:p-12" style={{ background: 'rgba(28,28,30,0.5)', border: '1px solid var(--border)' }}>
            <p className="section-label mb-8">Cronograma de Entregas</p>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Caixa Acumulado</th>
                    <th>Scooters Entregues</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { mes: '1', caixa: 'R$ 46.700', scooters: '0', status: 'Formação', color: 'gray' },
                    { mes: '2', caixa: 'R$ 93.400', scooters: '7', status: 'Início', color: 'blue' },
                    { mes: '3', caixa: 'R$ 140.100', scooters: '14', status: 'Ativo', color: 'blue' },
                    { mes: '4', caixa: 'R$ 186.800', scooters: '21', status: 'Ativo', color: 'blue' },
                    { mes: '5+', caixa: 'Crescente', scooters: '+7/mês', status: 'Contínuo', color: 'green' },
                  ].map((row, i) => (
                    <motion.tr
                      key={row.mes}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <td className="font-display text-2xl" style={{ fontFamily: 'var(--font-display)' }}>{row.mes}</td>
                      <td className="font-semibold">{row.caixa}</td>
                      <td>{row.scooters}</td>
                      <td>
                        <span className={`badge badge-${row.color}`}>{row.status}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCOOTER SHOWCASE ──────────────────────────────────── */}
      <section id="scooter" className="py-32 px-6 relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(10,132,255,0.06) 0%, transparent 70%)' }}
        />

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="section-label mb-4"
              >
                Scooter Elétrica
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="section-title mb-8"
              >
                Urban<br />100
              </motion.h2>

              <div>
                <SpecRow label="Motor" value="2000W Brushless" delay={0} />
                <SpecRow label="Autonomia" value="100 km" delay={0.05} />
                <SpecRow label="Velocidade Máx." value="65 km/h" delay={0.1} />
                <SpecRow label="Carga" value="4–6 horas" delay={0.15} />
                <SpecRow label="Bateria" value="60V / 30Ah Lítio" delay={0.2} />
                <SpecRow label="Frenagem" value="Disco hidráulico duplo" delay={0.25} />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-10"
              >
                <Link href="/cadastro" className="btn btn-primary gap-2">
                  Reservar Minha Vaga
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Visual placeholder — Three.js canvas aqui em prod */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div
                className="rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(28,28,30,0.8) 0%, rgba(10,20,50,0.8) 100%)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Decorative circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-64 h-64 rounded-full" style={{ border: '1px solid rgba(10,132,255,0.1)' }} />
                  <div className="absolute w-48 h-48 rounded-full" style={{ border: '1px solid rgba(10,132,255,0.08)' }} />
                  <div className="absolute w-32 h-32 rounded-full" style={{ border: '1px solid rgba(10,132,255,0.05)' }} />
                </div>

                {/* Center icon */}
                <div className="relative z-10 text-center animate-float">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(28,79,255,0.1))',
                      border: '1px solid rgba(10,132,255,0.3)',
                    }}
                  >
                    <Zap className="w-12 h-12" style={{ color: 'var(--blue)' }} />
                  </div>
                  <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--gray)' }}>Urban 100</p>
                  <p
                    className="text-4xl mt-1"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', letterSpacing: '0.05em' }}
                  >
                    2000W
                  </p>
                </div>

                {/* Corner tags */}
                <div className="absolute top-4 left-4">
                  <span className="badge badge-blue">Elétrico</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="badge badge-green">Disponível</span>
                </div>
                <div className="absolute bottom-4 right-4 text-right">
                  <p className="text-xs" style={{ color: 'var(--gray)' }}>A partir de</p>
                  <p className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--white)' }}>R$ 467<span className="text-sm font-normal">/mês</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Sem sorteio',
                desc: 'Entrega por ordem de entrada. Previsível, transparente, garantido.',
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: 'A partir do 2º mês',
                desc: 'As primeiras scooters são entregues já no segundo mês após a formação.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Contrato digital',
                desc: 'Assinatura eletrônica via Clicksign. Seguro, legal e sem burocracia.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-8 group transition-all duration-300"
                style={{
                  background: 'rgba(28,28,30,0.4)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(10,132,255,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(10,132,255,0.1)', color: 'var(--blue)' }}
                >
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10,132,255,0.07) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-label mb-6"
          >
            Vagas Limitadas
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="section-title mb-6"
          >
            Garanta Sua<br />Scooter Hoje
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-base mb-10 leading-relaxed"
            style={{ color: 'var(--gray)' }}
          >
            100 vagas por grupo. Entrega por ordem de entrada.<br />
            Sem sorteio. Sem surpresa. Só mobilidade.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/cadastro" className="btn btn-primary gap-2 px-10 py-4">
              Entrar no Urban 100
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/simulador" className="btn btn-outline px-10 py-4">
              Simular minha posição
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer
        className="py-12 px-6"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--blue)' }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', letterSpacing: '0.1em' }}>SCAATO</span>
          </div>

          <div className="flex items-center gap-6 text-xs tracking-wider uppercase" style={{ color: 'var(--gray)' }}>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link href="/cadastro" className="hover:text-white transition-colors">Cadastrar</Link>
            <Link href="/simulador" className="hover:text-white transition-colors">Simulador</Link>
          </div>

          <p className="text-xs" style={{ color: 'var(--gray)' }}>
            © 2025 SCAATO. Mobilidade elétrica.
          </p>
        </div>
      </footer>
    </div>
  )
}
