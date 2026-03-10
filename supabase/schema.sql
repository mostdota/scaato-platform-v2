-- ============================================
-- SCAATO PLATFORM v2 — Schema PostgreSQL
-- Execute no SQL Editor do Supabase
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. BRANDS (Multi-tenant)
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  primary_color   TEXT NOT NULL DEFAULT '#1DB954',
  secondary_color TEXT NOT NULL DEFAULT '#0a0a0a',
  logo_url        TEXT,
  domain          TEXT UNIQUE,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  email               TEXT NOT NULL,
  role                TEXT NOT NULL DEFAULT 'CUSTOMER'
                        CHECK (role IN ('ADMIN', 'CUSTOMER', 'AFFILIATE')),
  brand_id            UUID REFERENCES brands(id) ON DELETE SET NULL,
  avatar_url          TEXT,
  cpf                 TEXT UNIQUE,
  rg                  TEXT,
  phone               TEXT,
  address             TEXT,
  city                TEXT,
  state               TEXT,
  zip_code            TEXT,
  asaas_customer_id   TEXT UNIQUE,
  referral_code       TEXT UNIQUE DEFAULT upper(substring(md5(random()::text), 1, 8)),
  status              TEXT NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. SCOOTERS (Produtos disponíveis)
-- ============================================
CREATE TABLE IF NOT EXISTS scooters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    UUID REFERENCES brands(id) ON DELETE SET NULL,
  model       TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  image_url   TEXT,
  available   BOOLEAN NOT NULL DEFAULT true,
  specs       JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. ORDERS (Pedidos de compra)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scooter_id    UUID NOT NULL REFERENCES scooters(id) ON DELETE RESTRICT,
  status        TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN (
                    'PENDING', 'PAYMENT_PENDING', 'PAID',
                    'CONTRACT_PENDING', 'CONTRACT_SIGNED', 'ACTIVE', 'CANCELLED'
                  )),
  total_amount  NUMERIC(10,2) NOT NULL,
  referral_code TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 5. PAYMENTS (Cobranças)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  profile_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asaas_payment_id      TEXT UNIQUE,
  asaas_customer_id     TEXT,
  method                TEXT CHECK (method IN ('PIX', 'BOLETO', 'CREDIT_CARD')),
  value                 NUMERIC(10,2) NOT NULL,
  due_date              DATE NOT NULL,
  status                TEXT NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'CONFIRMED', 'OVERDUE', 'CANCELLED', 'REFUNDED')),
  paid_at               TIMESTAMPTZ,
  description           TEXT,
  invoice_url           TEXT,
  bank_slip_url         TEXT,
  pix_qr_code_image     TEXT,
  pix_qr_code_payload   TEXT,
  pix_expiry            TIMESTAMPTZ,
  raw_asaas_response    JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 6. CONTRACTS (Contratos digitais)
-- ============================================
CREATE TABLE IF NOT EXISTS contracts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  profile_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'SENT', 'SIGNED', 'CANCELLED')),
  hash                    TEXT,
  document_url            TEXT,
  signature_url           TEXT,
  clicksign_document_key  TEXT UNIQUE,
  clicksign_signer_key    TEXT,
  signed_at               TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 7. REFERRALS (Sistema de indicações)
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING', 'ACTIVE', 'CONVERTED')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- ============================================
-- 8. AFFILIATE_WALLETS
-- ============================================
CREATE TABLE IF NOT EXISTS affiliate_wallets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance       NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_earned  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 9. COMMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS commissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount        NUMERIC(10,2) NOT NULL,
  stage         TEXT NOT NULL CHECK (stage IN ('onSale', 'onThirdPayment', 'onContemplation')),
  status        TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING', 'APPROVED', 'PAID')),
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE brands             ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE scooters           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_wallets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions        ENABLE ROW LEVEL SECURITY;

-- BRANDS: público para leitura
CREATE POLICY "brands_public_select" ON brands FOR SELECT USING (true);
CREATE POLICY "brands_admin_all"     ON brands FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- PROFILES
CREATE POLICY "profiles_own_select"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"   ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- SCOOTERS: público
CREATE POLICY "scooters_public_select" ON scooters FOR SELECT USING (true);
CREATE POLICY "scooters_admin_all"     ON scooters FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ORDERS
CREATE POLICY "orders_own_select"  ON orders FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "orders_admin_all"   ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- PAYMENTS
CREATE POLICY "payments_own_select" ON payments FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "payments_admin_all"  ON payments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- CONTRACTS
CREATE POLICY "contracts_own_select" ON contracts FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "contracts_admin_all"  ON contracts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- REFERRALS
CREATE POLICY "referrals_own_select" ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "referrals_admin_all"  ON referrals FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- WALLETS
CREATE POLICY "wallets_own_select" ON affiliate_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallets_admin_all"  ON affiliate_wallets FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- COMMISSIONS
CREATE POLICY "commissions_own_select" ON commissions FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "commissions_admin_all"  ON commissions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ============================================
-- TRIGGERS E FUNÇÕES
-- ============================================

-- Auto updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER set_updated_at_brands      BEFORE UPDATE ON brands      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_profiles    BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_scooters    BEFORE UPDATE ON scooters    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_orders      BEFORE UPDATE ON orders      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_payments    BEFORE UPDATE ON payments    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_contracts   BEFORE UPDATE ON contracts   FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Auto-cria profile após cadastro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER')
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RPC para incrementar pagamento do participante
CREATE OR REPLACE FUNCTION increment_order_paid(p_order_id UUID, p_value NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Verifica se todos os pagamentos do pedido foram confirmados
  -- e atualiza o status do pedido para PAID
  IF NOT EXISTS (
    SELECT 1 FROM payments
    WHERE order_id = p_order_id AND status NOT IN ('CONFIRMED', 'CANCELLED', 'REFUNDED')
  ) THEN
    UPDATE orders SET status = 'PAID' WHERE id = p_order_id;
  END IF;
END; $$;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Brand padrão
INSERT INTO brands (id, name, primary_color, secondary_color)
VALUES ('a0000000-0000-0000-0000-000000000001', 'SCAATO', '#1DB954', '#0a0a0a')
ON CONFLICT DO NOTHING;

-- Scooter padrão
INSERT INTO scooters (brand_id, model, description, price, available, specs)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'SCAATO Urban 100',
  'Scooter elétrica urbana com autonomia de até 100km, motor de 2000W e carregamento rápido.',
  4500.00,
  true,
  '{"maxSpeed": "65 km/h", "range": "100 km", "battery": "60V 30Ah", "weight": "95 kg", "charging": "4-6 horas", "motor": "2000W"}'
) ON CONFLICT DO NOTHING;

-- Supabase Storage: criar bucket para contratos (execute separadamente se necessário)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', true);
