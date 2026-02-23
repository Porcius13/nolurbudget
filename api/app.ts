import { sql } from '@vercel/postgres';
import { ensureSchema } from './db';

// Single serverless function that handles all /api/* routes via vercel.json rewrite.
export default async function handler(req: any, res: any) {
  try {
    await ensureSchema();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.searchParams.get('path') || '';
    const method = req.method || 'GET';

    // Helper for parsing JSON body
    const body =
      req.body && typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // --- Transactions ---
    if (path === 'transactions') {
      if (method === 'GET') {
        const { rows } = await sql`
          SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          ORDER BY t.date DESC
        `;
        return res.status(200).json(rows);
      }

      if (method === 'POST') {
        const { amount, description, date, category_id, type, is_ai_generated } = body;
        const isExpense = type === 'expense';
        const roundUpAmount = isExpense ? Math.ceil(amount / 10) * 10 - amount : 0;

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

      if (method === 'DELETE') {
        const id = url.searchParams.get('id');
        await sql`DELETE FROM transactions WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      }
    }

    // --- Batch transactions ---
    if (path === 'transactions-batch' && method === 'POST') {
      const transactions = Array.isArray(body) ? body : [];

      for (const item of transactions) {
        await sql`
          INSERT INTO transactions (amount, description, date, category_id, type, is_ai_generated)
          VALUES (${item.amount}, ${item.description}, ${item.date}, ${item.category_id}, ${item.type}, ${!!item.is_ai_generated})
        `;
      }

      return res.status(200).json({ success: true });
    }

    // --- Categories ---
    if (path === 'categories') {
      const { rows } = await sql`SELECT * FROM categories ORDER BY id ASC`;
      return res.status(200).json(rows);
    }

    // --- Summary ---
    if (path === 'summary') {
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
    }

    // --- Budgets ---
    if (path === 'budgets') {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      if (method === 'GET') {
        const { rows } = await sql`
          SELECT b.*, c.name as category_name, c.color as category_color
          FROM budgets b
          JOIN categories c ON b.category_id = c.id
          WHERE b.month = ${currentMonth}
        `;
        return res.status(200).json(rows);
      }

      if (method === 'POST') {
        const { category_id, amount } = body;

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
    }

    // --- Subscriptions ---
    if (path === 'subscriptions') {
      if (method === 'GET') {
        const { rows } = await sql`
          SELECT s.*, c.name as category_name
          FROM subscriptions s
          LEFT JOIN categories c ON s.category_id = c.id
        `;
        return res.status(200).json(rows);
      }

      if (method === 'POST') {
        const { name, amount, category_id, frequency, next_date, type } = body;
        const inserted = await sql`
          INSERT INTO subscriptions (name, amount, category_id, frequency, next_date, type)
          VALUES (${name}, ${amount}, ${category_id}, ${frequency}, ${next_date}, ${type})
          RETURNING id
        `;
        return res.status(201).json({ id: inserted.rows[0].id });
      }
    }

    // --- Goals ---
    if (path === 'goals') {
      if (method === 'GET') {
        const { rows } = await sql`SELECT * FROM goals ORDER BY id ASC`;
        return res.status(200).json(rows);
      }

      if (method === 'POST') {
        const { name, target_amount, deadline, color, icon } = body;
        const inserted = await sql`
          INSERT INTO goals (name, target_amount, deadline, color, icon)
          VALUES (${name}, ${target_amount}, ${deadline}, ${color}, ${icon})
          RETURNING id
        `;
        return res.status(201).json({ id: inserted.rows[0].id });
      }
    }

    if (path === 'goals-contribute' && method === 'POST') {
      const id = url.searchParams.get('id');
      const { amount } = body;

      await sql`
        UPDATE goals
        SET current_amount = current_amount + ${amount}
        WHERE id = ${id}
      `;

      return res.status(200).json({ success: true });
    }

    // --- Investments ---
    if (path === 'investments') {
      if (method === 'GET') {
        const { rows } = await sql`SELECT * FROM investments ORDER BY id ASC`;
        return res.status(200).json(rows);
      }

      if (method === 'POST') {
        const { name, type, amount, purchase_price, currency } = body;
        const inserted = await sql`
          INSERT INTO investments (name, type, amount, purchase_price, currency)
          VALUES (${name}, ${type}, ${amount}, ${purchase_price}, ${currency || 'TRY'})
          RETURNING id
        `;
        return res.status(201).json({ id: inserted.rows[0].id });
      }
    }

    // --- Wallets ---
    if (path === 'wallets') {
      if (method === 'GET') {
        const { rows } = await sql`SELECT * FROM wallets ORDER BY id ASC`;
        return res.status(200).json(rows);
      }

      if (method === 'POST') {
        const { name, currency } = body;
        const inserted = await sql`
          INSERT INTO wallets (name, currency)
          VALUES (${name}, ${currency || 'TRY'})
          RETURNING id
        `;
        return res.status(201).json({ id: inserted.rows[0].id });
      }
    }

    // --- Tags ---
    if (path === 'tags') {
      if (method === 'GET') {
        const { rows } = await sql`SELECT * FROM tags ORDER BY id ASC`;
        return res.status(200).json(rows);
      }

      if (method === 'POST') {
        const { name, color } = body;
        const inserted = await sql`
          INSERT INTO tags (name, color)
          VALUES (${name}, ${color})
          ON CONFLICT (name) DO NOTHING
          RETURNING id
        `;
        return res.status(201).json({ id: inserted.rows[0]?.id });
      }
    }

    // --- User stats ---
    if (path === 'user-stats') {
      const existing = await sql`SELECT * FROM user_stats LIMIT 1`;
      if (existing.rows[0]) {
        return res.status(200).json(existing.rows[0]);
      }

      await sql`INSERT INTO user_stats (level, exp, streak) VALUES (1, 0, 0)`;
      return res.status(200).json({ level: 1, exp: 0, streak: 0 });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('app handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

