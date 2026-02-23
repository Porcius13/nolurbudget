import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { ensureSchema } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { rows } = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
      FROM transactions
      WHERE TO_CHAR(date, 'YYYY-MM') = ${month}
    `;

    const summary = rows[0] || { total_income: 0, total_expense: 0 };
    return res.status(200).json(summary);
  } catch (error) {
    console.error('summary handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

