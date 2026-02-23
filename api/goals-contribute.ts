import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { ensureSchema } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureSchema();

    const { id } = req.query;
    const { amount } = req.body;

    await sql`
      UPDATE goals
      SET current_amount = current_amount + ${amount}
      WHERE id = ${id}
    `;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('goals-contribute handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

