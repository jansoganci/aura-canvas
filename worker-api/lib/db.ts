// D1 Database helpers

import { nanoid } from 'nanoid';

export interface Session {
  id: string;
  session_token: string;
  credits: number;
  created_at: string;
}

export interface Aura {
  id: string;
  session_id: string;
  image_url: string;
  aura_color: string | null;
  aura_description: string | null;
  personality_answers: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  aura_id: string;
  visitor_id: string;
  color: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  session_id: string;
  credits: number;
  amount_cents: number;
  stripe_payment_id: string | null;
  status: string;
  created_at: string;
}

// Session operations
export async function createSession(db: D1Database): Promise<Session> {
  const id = nanoid();
  const sessionToken = nanoid(32);

  await db.prepare(
    'INSERT INTO sessions (id, session_token, credits) VALUES (?, ?, 1)'
  ).bind(id, sessionToken).run();

  const session = await db.prepare(
    'SELECT * FROM sessions WHERE id = ?'
  ).bind(id).first<Session>();

  return session!;
}

export async function getSessionByToken(db: D1Database, token: string): Promise<Session | null> {
  return db.prepare(
    'SELECT * FROM sessions WHERE session_token = ?'
  ).bind(token).first<Session>();
}

export async function updateCredits(db: D1Database, sessionId: string, credits: number): Promise<void> {
  await db.prepare(
    'UPDATE sessions SET credits = ? WHERE id = ?'
  ).bind(credits, sessionId).run();
}

// Aura operations
export async function createAura(
  db: D1Database,
  sessionId: string,
  imageUrl: string,
  auraColor: string,
  auraDescription: string,
  personalityAnswers: Record<string, string>
): Promise<Aura> {
  const id = nanoid();

  await db.prepare(
    'INSERT INTO auras (id, session_id, image_url, aura_color, aura_description, personality_answers) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, sessionId, imageUrl, auraColor, auraDescription, JSON.stringify(personalityAnswers)).run();

  const aura = await db.prepare(
    'SELECT * FROM auras WHERE id = ?'
  ).bind(id).first<Aura>();

  return aura!;
}

export async function getAuraById(db: D1Database, id: string): Promise<Aura | null> {
  return db.prepare(
    'SELECT * FROM auras WHERE id = ?'
  ).bind(id).first<Aura>();
}

export async function getAurasBySession(db: D1Database, sessionId: string): Promise<Aura[]> {
  const result = await db.prepare(
    'SELECT * FROM auras WHERE session_id = ? ORDER BY created_at DESC'
  ).bind(sessionId).all<Aura>();

  return result.results;
}

// Vote operations
export async function createVote(
  db: D1Database,
  auraId: string,
  visitorId: string,
  color: string
): Promise<Vote> {
  const id = nanoid();

  // Upsert - update if exists, insert if not
  await db.prepare(`
    INSERT INTO votes (id, aura_id, visitor_id, color)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(aura_id, visitor_id) DO UPDATE SET color = excluded.color
  `).bind(id, auraId, visitorId, color).run();

  const vote = await db.prepare(
    'SELECT * FROM votes WHERE aura_id = ? AND visitor_id = ?'
  ).bind(auraId, visitorId).first<Vote>();

  return vote!;
}

export async function getVotesByAura(db: D1Database, auraId: string): Promise<Vote[]> {
  const result = await db.prepare(
    'SELECT * FROM votes WHERE aura_id = ?'
  ).bind(auraId).all<Vote>();

  return result.results;
}

export async function getVoteByVisitor(
  db: D1Database,
  auraId: string,
  visitorId: string
): Promise<Vote | null> {
  return db.prepare(
    'SELECT * FROM votes WHERE aura_id = ? AND visitor_id = ?'
  ).bind(auraId, visitorId).first<Vote>();
}

// Purchase operations
export async function createPurchase(
  db: D1Database,
  sessionId: string,
  credits: number,
  amountCents: number
): Promise<Purchase> {
  const id = nanoid();

  await db.prepare(
    'INSERT INTO purchases (id, session_id, credits, amount_cents) VALUES (?, ?, ?, ?)'
  ).bind(id, sessionId, credits, amountCents).run();

  const purchase = await db.prepare(
    'SELECT * FROM purchases WHERE id = ?'
  ).bind(id).first<Purchase>();

  return purchase!;
}

export async function updatePurchaseStatus(
  db: D1Database,
  purchaseId: string,
  status: string,
  stripePaymentId?: string
): Promise<void> {
  if (stripePaymentId) {
    await db.prepare(
      'UPDATE purchases SET status = ?, stripe_payment_id = ? WHERE id = ?'
    ).bind(status, stripePaymentId, purchaseId).run();
  } else {
    await db.prepare(
      'UPDATE purchases SET status = ? WHERE id = ?'
    ).bind(status, purchaseId).run();
  }
}
