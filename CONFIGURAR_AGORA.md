# ✅ SCAATO v2 — Configuração Final

## O que já foi feito automaticamente:
- ✅ Projeto Supabase criado: `scaato-platform-v2` (região São Paulo)
- ✅ 9 tabelas criadas com RLS, triggers e dados iniciais
- ✅ Bucket `contracts` criado no Storage
- ✅ URL do Supabase: `https://uowhagnubylugbiqbsrw.supabase.co`
- ✅ Anon Key configurada

## ⚠️ Você precisa fazer 3 coisas:

### 1. Pegar a Service Role Key do Supabase
Acesse: https://supabase.com/dashboard/project/uowhagnubylugbiqbsrw/settings/api
- Clique em "Reveal" na seção **service_role** (a chave secreta)
- Copie e substitua no arquivo `.env.local`

### 2. Colocar suas chaves do Asaas e Clicksign no .env.local
```env
ASAAS_API_KEY=sua_chave_aqui
CLICKSIGN_API_KEY=sua_chave_aqui
```

### 3. Deploy no Vercel (2 opções):

#### Opção A — Via GitHub (recomendado):
1. Crie um repo no GitHub: https://github.com/new
2. Faça push: `git remote add origin SEU_REPO && git push -u origin master`
3. Importe no Vercel: https://vercel.com/new
4. Configure as variáveis de ambiente no Vercel

#### Opção B — Via Vercel CLI:
```bash
npm i -g vercel
cd scaato-v2
vercel login
vercel --prod
```

## Variáveis que precisam ir no Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://uowhagnubylugbiqbsrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=(pegar no painel Supabase)
ASAAS_API_KEY=(sua chave)
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
CLICKSIGN_API_KEY=(sua chave)
CLICKSIGN_API_URL=https://sandbox.clicksign.com/api/v1
NEXT_PUBLIC_APP_URL=https://SEU-DOMINIO.vercel.app
WEBHOOK_SECRET=(qualquer string aleatória)
```

## Criar primeiro admin após deploy:
Acesse o SQL Editor do Supabase e rode:
```sql
UPDATE profiles SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

## Configurar Webhooks após deploy:
**Asaas:** https://app.asaas.com/config/notification
- URL: `https://SEU-DOMINIO.vercel.app/api/webhooks/asaas`
- Eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE

**Clicksign:** No painel Clicksign → Configurações → Webhooks
- URL: `https://SEU-DOMINIO.vercel.app/api/webhooks/clicksign`
