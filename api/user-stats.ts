import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { ensureSchema } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();

    const existing = await sql`SELECT * FROM user_stats LIMIT 1`;
    if (existing.rows[0]) {
      return res.status(200).json(existing.rows[0]);
    }

    await sql`INSERT INTO user_stats (level, exp, streak) VALUES (1, 0, 0)`;
    return res.status(200).json({ level: 1, exp: 0, streak: 0 });
  } catch (error) {
    console.error('user-stats handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

