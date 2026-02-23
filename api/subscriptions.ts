import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { ensureSchema } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT s.*, c.name as category_name
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { name, amount, category_id, frequency, next_date, type } = req.body;
      const inserted = await sql`
        INSERT INTO subscriptions (name, amount, category_id, frequency, next_date, type)
        VALUES (${name}, ${amount}, ${category_id}, ${frequency}, ${next_date}, ${type})
        RETURNING id
      `;
      return res.status(201).json({ id: inserted.rows[0].id });
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('subscriptions handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

