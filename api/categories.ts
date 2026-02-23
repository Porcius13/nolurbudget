import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { ensureSchema } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();

    const { rows } = await sql`SELECT * FROM categories ORDER BY id ASC`;
    return res.status(200).json(rows);
  } catch (error) {
    console.error('categories handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

