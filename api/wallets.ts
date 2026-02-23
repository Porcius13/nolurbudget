import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { ensureSchema } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM wallets ORDER BY id ASC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { name, currency } = req.body;
      const inserted = await sql`
        INSERT INTO wallets (name, currency)
        VALUES (${name}, ${currency || 'TRY'})
        RETURNING id
      `;
      return res.status(201).json({ id: inserted.rows[0].id });
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('wallets handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

