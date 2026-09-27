-- Lliga Social de Pàdel — esquema inicial (ARCHITECTURE §11)

CREATE TABLE club (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Madrid'
);

CREATE TABLE season (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES club(id),
  name text NOT NULL,
  UNIQUE (club_id, name)
);

CREATE TABLE category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES club(id),
  code text NOT NULL,
  name text NOT NULL,
  -- Horari de joc de la categoria (clau de LeagueCalendar.schedules): WEEKDAY, WEEKEND…
  schedule text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (club_id, code)
);

CREATE TABLE level (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES club(id),
  code text NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (club_id, code)
);

CREATE TABLE court (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES club(id),
  number int NOT NULL,
  name text NOT NULL,
  UNIQUE (club_id, number)
);

CREATE TABLE blackout_date (
  club_id uuid NOT NULL REFERENCES club(id),
  date date NOT NULL,
  reason text NOT NULL,
  PRIMARY KEY (club_id, date)
);

CREATE TABLE competition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES season(id),
  slug text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'REGISTRATION_OPEN', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
  registration_deadline date,
  -- Dilluns de la setmana de la jornada 1.
  first_week date NOT NULL CHECK (extract(isodow FROM first_week) = 1),
  -- Data límit (inclou l'allargament màxim d'1 mes).
  end_date date NOT NULL,
  rules jsonb NOT NULL DEFAULT '{}',
  rules_version int NOT NULL DEFAULT 1,
  UNIQUE (season_id, slug),
  CHECK (first_week < end_date)
);

CREATE TABLE division (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competition(id),
  category_id uuid NOT NULL REFERENCES category(id),
  level_id uuid NOT NULL REFERENCES level(id),
  UNIQUE (competition_id, category_id, level_id)
);

CREATE TABLE player (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES club(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  email text,
  phone_normalized text,
  email_normalized text,
  is_member boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX player_phone_uq ON player (club_id, phone_normalized) WHERE phone_normalized IS NOT NULL;
CREATE UNIQUE INDEX player_email_uq ON player (club_id, email_normalized) WHERE email_normalized IS NOT NULL;

CREATE TABLE entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id uuid NOT NULL REFERENCES division(id),
  seed int,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WITHDRAWN')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE entry_player (
  entry_id uuid NOT NULL REFERENCES entry(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES player(id),
  -- Desnormalitzats per poder imposar la unicitat per categoria dins la prova.
  competition_id uuid NOT NULL REFERENCES competition(id),
  category_id uuid NOT NULL REFERENCES category(id),
  is_member boolean NOT NULL,
  registration_fee_cents int NOT NULL,
  welcome_pack_delivered_at timestamptz,
  PRIMARY KEY (entry_id, player_id),
  UNIQUE (competition_id, category_id, player_id)
);

-- Enllaç privat de parella (WhatsApp). Només es guarda el hash del token.
CREATE TABLE entry_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES entry(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE TABLE "group" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id uuid NOT NULL REFERENCES division(id),
  code text NOT NULL,
  UNIQUE (division_id, code)
);

CREATE TABLE group_member (
  group_id uuid NOT NULL REFERENCES "group"(id) ON DELETE CASCADE,
  entry_id uuid NOT NULL REFERENCES entry(id) UNIQUE,
  position int NOT NULL,
  PRIMARY KEY (group_id, entry_id),
  UNIQUE (group_id, position)
);

CREATE TABLE round (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES "group"(id) ON DELETE CASCADE,
  number int NOT NULL,
  week_start date NOT NULL CHECK (extract(isodow FROM week_start) = 1),
  UNIQUE (group_id, number)
);

CREATE TABLE match (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES "group"(id) ON DELETE CASCADE,
  round_id uuid REFERENCES round(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('REGULAR', 'TIEBREAK', 'PLAYOFF')),
  playoff_code text,
  week_start date NOT NULL CHECK (extract(isodow FROM week_start) = 1),
  entry_a_id uuid NOT NULL REFERENCES entry(id),
  entry_b_id uuid NOT NULL REFERENCES entry(id),
  status text NOT NULL DEFAULT 'UNSCHEDULED'
    CHECK (status IN ('UNSCHEDULED', 'PROPOSED', 'SCHEDULED', 'RESULT_PENDING', 'PLAYED', 'WALKOVER')),
  walkover_reason text CHECK (walkover_reason IN ('NO_SHOW', 'REPEATED_CANCELLATIONS', 'LATE_CANCELLATION')),
  CHECK (entry_a_id <> entry_b_id),
  UNIQUE (group_id, playoff_code)
);

-- Reserva de franja: proposada per una parella, confirmada per la rival.
-- Les franges són una graella fixa (torns de 90 min), per això n'hi ha prou amb un índex únic parcial
-- per garantir que una pista no té dues reserves actives alhora.
CREATE TABLE booking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES match(id) ON DELETE CASCADE,
  court_id uuid NOT NULL REFERENCES court(id),
  play_date date NOT NULL,
  start_time time NOT NULL,
  starts_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('PROPOSED', 'CONFIRMED', 'REJECTED', 'CANCELLED')),
  proposed_by_entry_id uuid NOT NULL REFERENCES entry(id),
  proposed_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  requires_approval boolean NOT NULL DEFAULT false,
  approved_at timestamptz,
  cancelled_by_entry_id uuid REFERENCES entry(id),
  cancelled_at timestamptz
);
CREATE UNIQUE INDEX booking_court_slot_uq ON booking (court_id, play_date, start_time)
  WHERE status IN ('PROPOSED', 'CONFIRMED');
CREATE UNIQUE INDEX booking_one_active_per_match ON booking (match_id)
  WHERE status IN ('PROPOSED', 'CONFIRMED');

CREATE TABLE cancellation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES match(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES booking(id),
  cancelled_by_entry_id uuid NOT NULL REFERENCES entry(id),
  cancelled_at timestamptz NOT NULL,
  match_starts_at timestamptz NOT NULL,
  outcome jsonb NOT NULL
);

-- Alineació real d'un partit quan hi juga un suplent.
CREATE TABLE match_lineup (
  match_id uuid NOT NULL REFERENCES match(id) ON DELETE CASCADE,
  entry_id uuid NOT NULL REFERENCES entry(id),
  player_id uuid NOT NULL REFERENCES player(id),
  PRIMARY KEY (match_id, player_id)
);

-- Resultats amb revisions (correccions). El vigent és la revisió més alta.
CREATE TABLE match_result (
  match_id uuid NOT NULL REFERENCES match(id) ON DELETE CASCADE,
  revision int NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('PLAYED', 'WALKOVER')),
  sets jsonb NOT NULL,
  time_limit jsonb,
  reported_by_entry_id uuid REFERENCES entry(id),
  reported_by_admin boolean NOT NULL DEFAULT false,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (match_id, revision)
);

CREATE TABLE charge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competition(id),
  player_id uuid NOT NULL REFERENCES player(id),
  concept text NOT NULL CHECK (concept IN ('REGISTRATION', 'MATCH')),
  match_id uuid REFERENCES match(id) ON DELETE CASCADE,
  amount_cents int NOT NULL CHECK (amount_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  voided_at timestamptz
);
CREATE UNIQUE INDEX charge_registration_uq ON charge (competition_id, player_id)
  WHERE concept = 'REGISTRATION' AND voided_at IS NULL;
CREATE UNIQUE INDEX charge_match_uq ON charge (match_id, player_id)
  WHERE concept = 'MATCH' AND voided_at IS NULL;

CREATE TABLE audit_log (
  id bigserial PRIMARY KEY,
  actor text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  data jsonb,
  at timestamptz NOT NULL DEFAULT now()
);
