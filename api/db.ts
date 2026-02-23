import { sql } from '@vercel/postgres';

// Simple helper to ensure schema exists.
// This is idempotent and can be called from functions that need it.
export async function ensureSchema() {
  // Categories
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      icon TEXT,
      color TEXT
    )
  `;

  // Transactions
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      amount DOUBLE PRECISION NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      is_ai_generated BOOLEAN DEFAULT FALSE,
      round_up DOUBLE PRECISION DEFAULT 0
    )
  `;

  // Budgets
  await sql`
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id),
      amount DOUBLE PRECISION NOT NULL,
      month TEXT NOT NULL
    )
  `;

  // Subscriptions
  await sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      frequency TEXT NOT NULL,
      next_date DATE NOT NULL,
      type TEXT DEFAULT 'expense'
    )
  `;

  // Goals
  await sql`
    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount DOUBLE PRECISION NOT NULL,
      current_amount DOUBLE PRECISION DEFAULT 0,
      deadline DATE,
      color TEXT,
      icon TEXT
    )
  `;

  // Tags
  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      color TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
      tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (transaction_id, tag_id)
    )
  `;

  // User stats
  await sql`
    CREATE TABLE IF NOT EXISTS user_stats (
      id SERIAL PRIMARY KEY,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_entry_date DATE,
      legacy_contact TEXT,
      stealth_mode BOOLEAN DEFAULT FALSE
    )
  `;

  // Investments
  await sql`
    CREATE TABLE IF NOT EXISTS investments (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      purchase_price DOUBLE PRECISION NOT NULL,
      current_price DOUBLE PRECISION,
      currency TEXT DEFAULT 'TRY'
    )
  `;

  // Wallets
  await sql`
    CREATE TABLE IF NOT EXISTS wallets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      balance DOUBLE PRECISION DEFAULT 0,
      currency TEXT DEFAULT 'TRY'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS wallet_users (
      wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
      user_id TEXT,
      role TEXT DEFAULT 'member',
      PRIMARY KEY (wallet_id, user_id)
    )
  `;

  // Documents
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      content TEXT,
      expiry_date TIMESTAMP,
      metadata TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Seed default categories if empty
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM categories`;
  if (rows[0]?.count === 0) {
    await sql`
      INSERT INTO categories (name, type, icon, color)
      VALUES
        ('Maaş', 'income', 'Wallet', '#10b981'),
        ('Ek Gelir', 'income', 'PlusCircle', '#34d399'),
        ('Gıda', 'expense', 'Utensils', '#f59e0b'),
        ('Kira', 'expense', 'Home', '#3b82f6'),
        ('Ulaşım', 'expense', 'Car', '#6366f1'),
        ('Eğlence', 'expense', 'Music', '#ec4899'),
        ('Sağlık', 'expense', 'HeartPulse', '#ef4444'),
        ('Alışveriş', 'expense', 'ShoppingBag', '#f97316'),
        ('Faturalar', 'expense', 'Zap', '#eab308'),
        ('Diğer', 'expense', 'MoreHorizontal', '#94a3b8')
      ON CONFLICT DO NOTHING
    `;
  }
}

