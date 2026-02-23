import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { ensureSchema } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        ORDER BY t.date DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { amount, description, date, category_id, type, is_ai_generated } = req.body;
      const isExpense = type === 'expense';
      const roundUpAmount = isExpense ? (Math.ceil(amount / 10) * 10) - amount : 0;

      const insertResult = await sql`
        INSERT INTO transactions (amount, description, date, category_id, type, is_ai_generated, round_up)
        VALUES (${amount}, ${description}, ${date}, ${category_id}, ${type}, ${!!is_ai_generated}, ${roundUpAmount})
        RETURNING id
      `;

      if (roundUpAmount > 0) {
        await sql`
          UPDATE goals
          SET current_amount = current_amount + ${roundUpAmount}
          WHERE id = (
            SELECT id FROM goals ORDER BY RANDOM() LIMIT 1
          )
        `;
      }

      return res.status(201).json({ id: insertResult.rows[0].id, round_up: roundUpAmount });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      await sql`DELETE FROM transactions WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'PUT') {
      return res.status(405).json({ error: 'Not implemented' });
    }

    res.setHeader('Allow', 'GET,POST,DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('transactions handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

