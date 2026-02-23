import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { ensureSchema } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT b.*, c.name as category_name, c.color as category_color
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        WHERE b.month = ${currentMonth}
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { category_id, amount } = req.body;

      const existing = await sql`
        SELECT id FROM budgets WHERE category_id = ${category_id} AND month = ${currentMonth}
      `;

      if (existing.rows[0]) {
        await sql`
          UPDATE budgets
          SET amount = ${amount}
          WHERE id = ${existing.rows[0].id}
        `;
        return res.status(200).json({ id: existing.rows[0].id, updated: true });
      } else {
        const inserted = await sql`
          INSERT INTO budgets (category_id, amount, month)
          VALUES (${category_id}, ${amount}, ${currentMonth})
          RETURNING id
        `;
        return res.status(201).json({ id: inserted.rows[0].id });
      }
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('budgets handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

