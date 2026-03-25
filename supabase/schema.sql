-- ============================================================
--  Menuiserie Conan — Supabase Database Schema
--  Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ── Leads table (from public contact/quote form) ──────────────
CREATE TABLE IF NOT EXISTS leads (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  full_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  phone         TEXT,
  project_type  TEXT,
  message       TEXT,
  status        TEXT        DEFAULT 'nouvelle_demande'
                CHECK (status IN ('nouvelle_demande', 'devis_envoye', 'accepte', 'refuse'))
);

-- ── Clients table (business directory) ───────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  full_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  phone         TEXT,
  city          TEXT,
  notes         TEXT
);

-- ── Projects table (linked to clients) ───────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  client_id     UUID        REFERENCES clients(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  type          TEXT,
  status        TEXT        DEFAULT 'en_cours'
                CHECK (status IN ('en_cours', 'termine', 'en_pause', 'annule')),
  budget        NUMERIC(10, 2),
  start_date    DATE,
  end_date      DATE
);

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE leads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Leads: anyone (anon) can INSERT (public quote form),
--        only authenticated users can SELECT / UPDATE / DELETE
CREATE POLICY "Public can submit leads"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (true);

-- Clients: only authenticated users
CREATE POLICY "Authenticated full access to clients"
  ON clients
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Projects: only authenticated users
CREATE POLICY "Authenticated full access to projects"
  ON projects
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_client  ON projects (client_id);

-- ── Mock Data — Clients ────────────────────────────────────────
INSERT INTO clients (full_name, email, phone, city, notes) VALUES
  (
    'Jean-Pierre Moreau',
    'jp.moreau@email.fr',
    '06 12 34 56 78',
    'Paris 16e',
    'Client VIP. Appartement haussmannien 180m². Sensible aux matériaux nobles.'
  ),
  (
    'Marie Dupont',
    'marie.dupont@gmail.com',
    '06 87 65 43 21',
    'Lyon 6e',
    'Villa contemporaine. Budget confortable. Aime le style scandinave.'
  ),
  (
    'Thomas Bernard',
    'thomas.bernard@pro.fr',
    '07 23 45 67 89',
    'Bordeaux',
    'Architecte d''intérieur indépendant. Potentiel de partenariat long terme.'
  );

-- ── Mock Data — Leads ──────────────────────────────────────────
INSERT INTO leads (full_name, email, phone, project_type, message, status) VALUES
  (
    'Jean-Pierre Moreau',
    'jp.moreau@email.fr',
    '06 12 34 56 78',
    'cuisine',
    'Je souhaite réaliser une cuisine entièrement sur mesure pour mon appartement haussmannien du 16e. Plan ouvert sur le salon, environ 14m². Budget flexible pour de la vraie qualité. Disponible pour une visite dès la semaine prochaine.',
    'nouvelle_demande'
  ),
  (
    'Marie Dupont',
    'marie.dupont@gmail.com',
    '06 87 65 43 21',
    'agencement',
    'Rénovation complète du salon avec bibliothèque intégrée sur toute la hauteur (2,8m) et meuble TV sur mesure. Salon de 35m², style contemporain avec des bois clairs. Le devis a été envoyé, en attente de retour.',
    'devis_envoye'
  ),
  (
    'Thomas Bernard',
    'thomas.bernard@pro.fr',
    '07 23 45 67 89',
    'mobilier',
    'Bureau à domicile avec rangements sur mesure, espace pour deux écrans et imprimante cachée. Style contemporain, bois clair type chêne blanchi. Pièce de 12m². Devis accepté, chantier prévu en avril.',
    'accepte'
  );

-- ── Mock Data — Projects ───────────────────────────────────────
-- (Link to the clients created above — adjust UUIDs if needed)
-- These are inserted via subquery to get the correct client IDs
INSERT INTO projects (client_id, title, type, status, budget, start_date, end_date)
SELECT
  c.id,
  'Bureau sur mesure — Bordeaux',
  'mobilier',
  'en_cours',
  8500.00,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '6 weeks'
FROM clients c WHERE c.email = 'thomas.bernard@pro.fr' LIMIT 1;

INSERT INTO projects (client_id, title, type, status, budget, start_date, end_date)
SELECT
  c.id,
  'Bibliothèque & meuble TV — Lyon',
  'agencement',
  'en_cours',
  12000.00,
  CURRENT_DATE + INTERVAL '2 weeks',
  CURRENT_DATE + INTERVAL '8 weeks'
FROM clients c WHERE c.email = 'marie.dupont@gmail.com' LIMIT 1;
