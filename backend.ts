import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { format } from "date-fns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("budget.db");

// Initialize Database
try {
  db.exec(`
    -- Existing tables creation...
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      icon TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      category_id INTEGER,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      is_ai_generated INTEGER DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      amount REAL NOT NULL,
      month TEXT NOT NULL, -- YYYY-MM
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      category_id INTEGER,
      frequency TEXT NOT NULL, -- weekly, monthly, yearly
      next_date TEXT NOT NULL,
      type TEXT DEFAULT 'expense',
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT,
      color TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (transaction_id, tag_id),
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_entry_date TEXT
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      purchase_price REAL NOT NULL,
      current_price REAL,
      currency TEXT DEFAULT 'TRY'
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      balance REAL DEFAULT 0,
      currency TEXT DEFAULT 'TRY'
    );

    CREATE TABLE IF NOT EXISTS wallet_users (
      wallet_id INTEGER,
      user_id TEXT,
      role TEXT DEFAULT 'member',
      PRIMARY KEY (wallet_id, user_id),
      FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      content TEXT,
      expiry_date DATETIME,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {
  // Ignore table creation errors if they already exist
}

// Phase 11 Updates - Run separately to handle "column already exists" errors
try { db.exec("ALTER TABLE transactions ADD COLUMN round_up REAL DEFAULT 0;"); } catch (e) { }
try { db.exec("ALTER TABLE user_stats ADD COLUMN legacy_contact TEXT;"); } catch (e) { }
try { db.exec("ALTER TABLE user_stats ADD COLUMN stealth_mode INTEGER DEFAULT 0;"); } catch (e) { }

// Seed default categories if empty
const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  const insertCategory = db.prepare("INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)");
  const defaults = [
    ['Maaş', 'income', 'Wallet', '#10b981'],
    ['Ek Gelir', 'income', 'PlusCircle', '#34d399'],
    ['Gıda', 'expense', 'Utensils', '#f59e0b'],
    ['Kira', 'expense', 'Home', '#3b82f6'],
    ['Ulaşım', 'expense', 'Car', '#6366f1'],
    ['Eğlence', 'expense', 'Music', '#ec4899'],
    ['Sağlık', 'expense', 'HeartPulse', '#ef4444'],
    ['Alışveriş', 'expense', 'ShoppingBag', '#f97316'],
    ['Faturalar', 'expense', 'Zap', '#eab308'],
    ['Diğer', 'expense', 'MoreHorizontal', '#94a3b8']
  ];
  defaults.forEach(cat => insertCategory.run(...cat));
}

// Subscription Processor
function processSubscriptions() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const due = db.prepare("SELECT * FROM subscriptions WHERE next_date <= ?").all(today) as any[];

  for (const sub of due) {
    // Create transaction
    db.prepare("INSERT INTO transactions (amount, description, date, category_id, type) VALUES (?, ?, ?, ?, ?)")
      .run(sub.amount, sub.name, today, sub.category_id, sub.type);

    // Update next date (basic monthly increment)
    const nextDate = new Date(sub.next_date);
    if (sub.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (sub.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (sub.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

    db.prepare("UPDATE subscriptions SET next_date = ? WHERE id = ?").run(format(nextDate, 'yyyy-MM-dd'), sub.id);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  processSubscriptions();

  // API Routes
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.get("/api/transactions", (req, res) => {
    const transactions = db.prepare(`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC
    `).all();
    res.json(transactions);
  });

  app.post("/api/transactions", (req, res) => {
    const { amount, description, date, category_id, type, is_ai_generated } = req.body;
    const isExpense = type === 'expense';
    const roundUpAmount = isExpense ? (Math.ceil(amount / 10) * 10) - amount : 0;

    const result = db.prepare(
      "INSERT INTO transactions (amount, description, date, category_id, type, is_ai_generated, round_up) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(amount, description, date, category_id, type, is_ai_generated ? 1 : 0, roundUpAmount);

    // If round-up exists, potentially boost a random goal
    if (roundUpAmount > 0) {
      db.prepare("UPDATE goals SET current_amount = current_amount + ? WHERE id = (SELECT id FROM goals ORDER BY RANDOM() LIMIT 1)").run(roundUpAmount);
    }

    res.json({ id: result.lastInsertRowid, round_up: roundUpAmount });
  });

  app.post("/api/transactions/batch", (req, res) => {
    const transactions = req.body;
    const insert = db.prepare(
      "INSERT INTO transactions (amount, description, date, category_id, type, is_ai_generated) VALUES (?, ?, ?, ?, ?, ?)"
    );

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insert.run(item.amount, item.description, item.date, item.category_id, item.type, item.is_ai_generated ? 1 : 0);
      }
    });

    insertMany(transactions);
    res.json({ success: true });
  });

  app.delete("/api/transactions/:id", (req, res) => {
    db.prepare("DELETE FROM transactions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/summary", (req, res) => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const summary = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
      FROM transactions
      WHERE strftime('%Y-%m', date) = ?
    `).get(currentMonth);
    res.json(summary || { total_income: 0, total_expense: 0 });
  });

  app.get("/api/budgets", (req, res) => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const budgets = db.prepare(`
      SELECT b.*, c.name as category_name, c.color as category_color
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.month = ?
    `).all(currentMonth);
    res.json(budgets);
  });

  app.post("/api/budgets", (req, res) => {
    const { category_id, amount } = req.body;
    const currentMonth = format(new Date(), 'yyyy-MM');

    // Check if budget already exists for this category/month
    const existing = db.prepare("SELECT id FROM budgets WHERE category_id = ? AND month = ?").get(category_id, currentMonth) as { id: number } | undefined;

    if (existing) {
      db.prepare("UPDATE budgets SET amount = ? WHERE id = ?").run(amount, existing.id);
      res.json({ id: existing.id, updated: true });
    } else {
      const result = db.prepare(
        "INSERT INTO budgets (category_id, amount, month) VALUES (?, ?, ?)"
      ).run(category_id, amount, currentMonth);
      res.json({ id: result.lastInsertRowid });
    }
  });


  // Subscriptions
  app.get("/api/subscriptions", (req, res) => {
    const subs = db.prepare(`
        SELECT s.*, c.name as category_name 
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
      `).all();
    res.json(subs);
  });

  app.post("/api/subscriptions", (req, res) => {
    const { name, amount, category_id, frequency, next_date, type } = req.body;
    const result = db.prepare(
      "INSERT INTO subscriptions (name, amount, category_id, frequency, next_date, type) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(name, amount, category_id, frequency, next_date, type);
    res.json({ id: result.lastInsertRowid });
  });

  // Goals
  app.get("/api/goals", (req, res) => {
    const goals = db.prepare("SELECT * FROM goals").all();
    res.json(goals);
  });

  app.post("/api/goals", (req, res) => {
    const { name, target_amount, deadline, color, icon } = req.body;
    const result = db.prepare(
      "INSERT INTO goals (name, target_amount, deadline, color, icon) VALUES (?, ?, ?, ?, ?)"
    ).run(name, target_amount, deadline, color, icon);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/goals/:id/contribute", (req, res) => {
    const { amount } = req.body;
    db.prepare("UPDATE goals SET current_amount = current_amount + ? WHERE id = ?").run(amount, req.params.id);
    res.json({ success: true });
  });

  // Investments
  app.get("/api/investments", (req, res) => {
    const investments = db.prepare("SELECT * FROM investments").all();
    res.json(investments);
  });

  app.post("/api/investments", (req, res) => {
    const { name, type, amount, purchase_price, currency } = req.body;
    const result = db.prepare(
      "INSERT INTO investments (name, type, amount, purchase_price, currency) VALUES (?, ?, ?, ?, ?)"
    ).run(name, type, amount, purchase_price, currency || 'TRY');
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/wallets", (req, res) => {
    const wallets = db.prepare("SELECT * FROM wallets").all();
    res.json(wallets);
  });

  app.post("/api/wallets", (req, res) => {
    const { name, currency } = req.body;
    const result = db.prepare("INSERT INTO wallets (name, currency) VALUES (?, ?)").run(name, currency || 'TRY');
    res.json({ id: result.lastInsertRowid });
  });

  // Tags
  app.get("/api/tags", (req, res) => {
    const tags = db.prepare("SELECT * FROM tags").all();
    res.json(tags);
  });

  app.post("/api/tags", (req, res) => {
    const { name, color } = req.body;
    const result = db.prepare("INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)").run(name, color);
    res.json({ id: result.lastInsertRowid });
  });

  // User Stats
  app.get("/api/user-stats", (req, res) => {
    let stats = db.prepare("SELECT * FROM user_stats LIMIT 1").get() as any;
    if (!stats) {
      db.prepare("INSERT INTO user_stats (level, exp, streak) VALUES (1, 0, 0)").run();
      stats = { level: 1, exp: 0, streak: 0 };
    }
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
