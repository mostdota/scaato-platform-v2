# SCAATO Platform v2

> Plataforma de aquisição de scooters elétricas — versão profissional com Next.js 14

## Stack Tecnológica

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Banco de dados**: PostgreSQL via Supabase (com RLS)
- **Auth**: Supabase Auth
- **Pagamentos**: Asaas (PIX, Boleto, Cartão)
- **Contratos**: Clicksign (assinatura digital)
- **Formulários**: React Hook Form + Zod
- **Charts**: Recharts
- **PDF**: pdf-lib

## Estrutura do Projeto

```
scaato-platform/
├── src/
│   ├── app/
│   │   ├── page.tsx               ← Landing page
│   │   ├── login/                 ← Autenticação
│   │   ├── cadastro/              ← Registro com 3 etapas
│   │   ├── simulador/             ← Simulador de economia
│   │   ├── participant/           ← Área do cliente
│   │   │   ├── dashboard/         ← Painel principal
│   │   │   ├── buy/               ← Comprar scooter
│   │   │   ├── payments/          ← Pagamentos
│   │   │   ├── contracts/         ← Contratos
│   │   │   └── referrals/         ← Indicações
│   │   ├── admin/                 ← Área administrativa
│   │   │   └── dashboard/         ← Analytics
│   │   └── api/
│   │       ├── payments/create/   ← Cria cobrança Asaas
│   │       └── webhooks/
│   │           ├── asaas/         ← Webhook pagamentos
│   │           └── clicksign/     ← Webhook contratos
│   ├── components/
│   │   ├── landing/               ← Landing page
│   │   ├── layout/                ← Sidebar + TopBar
│   │   ├── dashboard/             ← Componentes cliente
│   │   └── admin/                 ← Componentes admin
│   ├── lib/supabase/              ← Clientes Supabase
│   ├── services/
│   │   ├── asaas.ts               ← Integração Asaas
│   │   ├── clicksign.ts           ← Integração Clicksign
│   │   └── pdf.ts                 ← Geração de PDF
│   ├── types/                     ← Tipos TypeScript
│   └── utils/                     ← Funções utilitárias
└── supabase/
    └── schema.sql                 ← Schema completo do banco
```

## Setup Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha os valores no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

ASAAS_API_KEY=$aact_SUA_CHAVE
ASAAS_API_URL=https://sandbox.asaas.com/api/v3

CLICKSIGN_API_KEY=sua_access_token
CLICKSIGN_API_URL=https://sandbox.clicksign.com/api/v1

NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=gere-um-uuid-aleatorio
```

### 3. Banco de dados

Execute o arquivo `supabase/schema.sql` no SQL Editor do Supabase.

### 4. Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000

## Criando o Primeiro Admin

Após criar uma conta pelo `/cadastro`, execute no Supabase:

```sql
UPDATE profiles SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

## Deploy no Vercel

```bash
npm install -g vercel
vercel --prod
```

Configure as variáveis de ambiente no painel do Vercel.

## Webhooks de Produção

Após o deploy, configure os webhooks:

**Asaas:**
- URL: `https://seu-dominio.vercel.app/api/webhooks/asaas`
- Eventos: PAYMENT_CREATED, PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE

**Clicksign:**
- URL: `https://seu-dominio.vercel.app/api/webhooks/clicksign`

## Funcionalidades

| Funcionalidade         | Status |
|------------------------|--------|
| Landing page           | ✅ |
| Simulador de economia  | ✅ |
| Cadastro multi-step    | ✅ |
| Login                  | ✅ |
| Dashboard cliente      | ✅ |
| Compra de scooter      | ✅ |
| Pagamentos (PIX/Boleto/Cartão) | ✅ |
| Contratos digitais     | ✅ |
| Indicações             | ✅ |
| Dashboard admin        | ✅ |
| Gráficos de receita    | ✅ |
| Middleware de auth     | ✅ |
| RLS no Supabase        | ✅ |
| Webhooks Asaas         | ✅ |
| Webhooks Clicksign     | ✅ |
| Geração de PDF         | ✅ |

## Arquitetura de Segurança

- **RLS (Row Level Security)** no Supabase para cada tabela
- **Middleware Next.js** para proteção de rotas por role
- **Validação Zod** em todas as API Routes
- **Supabase SSR** para autenticação server-side
- **Service Role Key** apenas no servidor

---

Desenvolvido com ❤️ para SCAATO
