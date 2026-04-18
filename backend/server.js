import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);
const adminPassword = process.env.ADMIN_PASSWORD;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

if (!adminPassword) {
  throw new Error('ADMIN_PASSWORD не задан в переменных окружения.');
}

const db = new Database(path.join(__dirname, 'messages.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(express.json({ limit: '32kb' }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin запрещён.'));
  }
}));

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов. Повторите позже.' }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа. Повторите позже.' }
});

function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\u0000/g, '').trim().slice(0, maxLength);
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token || token !== adminPassword) {
    return res.status(401).json({ error: 'Доступ запрещён.' });
  }

  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/submit', submitLimiter, (req, res) => {
  const name = sanitizeText(req.body?.name, 120);
  const message = sanitizeText(req.body?.message, 9000);

  if (!name || !message) {
    return res.status(400).json({ error: 'Имя и текст обязательны.' });
  }

  if (message.length > 9000) {
    return res.status(400).json({ error: 'Текст превышает 9000 символов.' });
  }

  const stmt = db.prepare('INSERT INTO submissions (name, message, created_at) VALUES (?, ?, ?)');
  const result = stmt.run(name, message, new Date().toISOString());

  res.status(201).json({ ok: true, id: result.lastInsertRowid });
});

app.get('/api/submissions', adminLimiter, requireAdmin, (_req, res) => {
  const stmt = db.prepare('SELECT id, name, message, created_at FROM submissions ORDER BY id DESC LIMIT 200');
  const items = stmt.all();
  res.json({ ok: true, items });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
