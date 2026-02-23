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

    const transactions = req.body as any[];
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    for (const item of transactions) {
      await sql`
        INSERT INTO transactions (amount, description, date, category_id, type, is_ai_generated)
        VALUES (${item.amount}, ${item.description}, ${item.date}, ${item.category_id}, ${item.type}, ${!!item.is_ai_generated})
      `;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('transactions-batch handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

