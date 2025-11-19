-- Sessions (anonymous users)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Auras (created sessions)
CREATE TABLE IF NOT EXISTS auras (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  aura_color TEXT,
  aura_description TEXT,
  personality_answers TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  aura_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (aura_id) REFERENCES auras(id),
  UNIQUE(aura_id, visitor_id)
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auras_session ON auras(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_aura ON votes(aura_id);
CREATE INDEX IF NOT EXISTS idx_purchases_session ON purchases(session_id);
