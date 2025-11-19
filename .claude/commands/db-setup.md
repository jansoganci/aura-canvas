# Database Setup

Set up persistent storage for Aura Canvas.

## Task
Configure database: $ARGUMENTS

## Recommended Options

### Option 1: Cloudflare D1 (SQLite)
Best for: Simple queries, Cloudflare ecosystem
```bash
# Create D1 database
wrangler d1 create aura-canvas-db

# Add to wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "aura-canvas-db"
database_id = "your-database-id"
```

### Option 2: Cloudflare KV
Best for: Key-value data, simple lookups
```bash
wrangler kv:namespace create "AURA_DATA"
```

### Option 3: Supabase
Best for: Full PostgreSQL, real-time, auth
- Create project at supabase.com
- Install: `npm install @supabase/supabase-js`

### Option 4: PlanetScale / Turso
Best for: Edge-compatible MySQL/SQLite

## Data Models to Store

```typescript
// Users (if auth added)
interface User {
  id: string;
  username: string;
  profileImageUrl: string;
  createdAt: Date;
}

// Aura Sessions
interface AuraSession {
  id: string;
  userId?: string;
  imageUrl: string;
  personalityAnswers: Record<string, string>;
  createdAt: Date;
}

// Votes
interface Vote {
  id: string;
  sessionId: string visitorId: string;
  auraColor: AuraColor;
  createdAt: Date;
}

// Comments
interface Comment {
  id: string;
  sessionId: string;
  username: string;
  comment: string;
  auraColor: AuraColor;
  createdAt: Date;
}
```

## Implementation Steps
1. Choose database option
2. Set up connection
3. Create schema/tables
4. Add API endpoints in worker-api
5. Update frontend to use real data
6. Remove dummy data from constants.ts
