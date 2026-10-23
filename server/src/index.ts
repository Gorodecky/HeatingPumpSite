import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';

declare module 'express-session' {
  interface SessionData {
    adminId?: string;
    csrfToken?: string;
  }
}

const requiredEnv = ['DATABASE_URL', 'SESSION_SECRET'] as const;
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if (process.env.SESSION_SECRET!.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');

const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3001);
const policyVersion = process.env.POLICY_VERSION || '2026-10-23';
const prisma = new PrismaClient();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PgSessionStore = connectPgSimple(session);
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', isProduction ? 1 : false);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '16kb', strict: true }));
app.use(session({
  store: new PgSessionStore({ pool, tableName: 'Session' }),
  name: 'heating.sid',
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', secure: isProduction, maxAge: 8 * 60 * 60 * 1000 },
}));

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Забагато спроб. Спробуйте пізніше.' } });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Забагато спроб входу. Спробуйте пізніше.' } });
const csrfLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });

const text = (max: number) => z.string().trim().transform(value => value.replace(/\s+/g, ' ')).pipe(z.string().min(1).max(max));
const optionalComment = z.string().optional().transform(value => value?.trim().replace(/\s+/g, ' ') || undefined).pipe(z.string().max(2000).optional());
const leadSchema = z.object({
  source: z.enum(['selection', 'contact']),
  city: z.union([z.string(), z.undefined()]).transform(value => value?.trim().replace(/\s+/g, ' ') || undefined).pipe(z.string().min(1).max(100).optional()),
  area: z.enum(['До 100 м²', '100–150 м²', '150–250 м²', 'Понад 250 м²', 'Не знаю']).optional(),
  object: z.enum(['Новий будинок', 'Будинок для реконструкції', 'Інше', 'Не знаю']).optional(),
  heating: z.enum(['Тепла підлога', 'Радіатори', 'Комбінована система', 'Опалення ще немає', 'Не знаю']).optional(),
  timing: z.enum(['Найближчим часом', 'Протягом 3–6 місяців', 'Пізніше', 'Поки вивчаю', 'Не знаю']).optional(),
  name: text(100),
  phone: z.string().trim().transform(value => value.replace(/[\s().-]/g, '')).refine(value => /^\+?\d{9,15}$/.test(value), 'Некоректний номер телефону').transform(value => value.startsWith('+') ? value : `+${value}`),
  comment: optionalComment,
  consent: z.literal(true),
}).strict().superRefine((lead, context) => {
  if (lead.source === 'selection') {
    for (const key of ['city', 'area', 'object', 'heating', 'timing'] as const) {
      if (!lead[key]) context.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: 'Обов’язкове поле' });
    }
  }
});

function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const supplied = req.get('x-csrf-token');
  if (!req.session.csrfToken || !supplied || supplied !== req.session.csrfToken) {
    res.status(403).json({ error: 'Перевірка запиту не пройдена. Оновіть сторінку та спробуйте ще раз.' });
    return;
  }
  const origin = req.get('origin');
  const appOrigin = process.env.APP_ORIGIN;
  if (origin && appOrigin && origin !== appOrigin) {
    res.status(403).json({ error: 'Неприпустиме джерело запиту.' });
    return;
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    res.status(401).json({ error: 'Потрібен вхід адміністратора.' });
    return;
  }
  next();
}

app.get('/api/v1/health', async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok' }); }
  catch { res.status(503).json({ status: 'unavailable' }); }
});

app.post('/api/v1/leads', publicLimiter, async (req, res, next) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Перевірте заповнення форми.', fields: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const input = parsed.data;
    const lead = await prisma.lead.create({
      data: {
        source: input.source,
        city: input.city,
        area: input.area,
        objectType: input.object,
        heatingSystem: input.heating,
        realizationTiming: input.timing,
        name: input.name,
        phone: input.phone,
        comment: input.comment,
        consentGiven: true,
        consentAt: new Date(),
        policyVersion,
      },
      select: { id: true, createdAt: true, status: true },
    });
    res.status(201).json({ lead });
  } catch (error) { next(error); }
});

app.get('/api/v1/auth/csrf', csrfLimiter, (req, res, next) => {
  if (req.session.csrfToken) {
    res.set('Cache-Control', 'no-store').json({ token: req.session.csrfToken });
    return;
  }
  req.session.csrfToken = randomBytes(32).toString('hex');
  req.session.save(error => {
    if (error) { next(error); return; }
    res.set('Cache-Control', 'no-store').json({ token: req.session.csrfToken });
  });
});

const loginSchema = z.object({ username: z.string().trim().min(1).max(80), password: z.string().min(1).max(200) }).strict();
app.post('/api/v1/auth/login', loginLimiter, csrfProtection, async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Вкажіть логін і пароль.' }); return; }
  try {
    const admin = await prisma.adminUser.findUnique({ where: { username: parsed.data.username } });
    const valid = admin ? await argon2.verify(admin.passwordHash, parsed.data.password) : false;
    if (!admin || !valid) { res.status(401).json({ error: 'Неправильний логін або пароль.' }); return; }
    req.session.regenerate(error => {
      if (error) { next(error); return; }
      req.session.adminId = admin.id;
      req.session.csrfToken = randomBytes(32).toString('hex');
      req.session.save(saveError => {
        if (saveError) { next(saveError); return; }
        res.set('Cache-Control', 'no-store').json({ authenticated: true, csrfToken: req.session.csrfToken });
      });
    });
  } catch (error) { next(error); }
});

app.get('/api/v1/auth/me', csrfProtection, requireAdmin, (_req, res) => res.set('Cache-Control', 'no-store').json({ authenticated: true }));
app.post('/api/v1/auth/logout', csrfProtection, requireAdmin, (req, res, next) => {
  req.session.destroy(error => {
    if (error) { next(error); return; }
    res.clearCookie('heating.sid', { httpOnly: true, sameSite: 'strict', secure: isProduction }).status(204).end();
  });
});

app.get('/api/v1/admin/leads', csrfProtection, requireAdmin, async (_req, res, next) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }, take: 100,
      select: { id: true, createdAt: true, status: true, source: true, city: true, area: true, objectType: true, heatingSystem: true, realizationTiming: true, name: true, phone: true, comment: true },
    });
    res.set('Cache-Control', 'no-store').json({ leads });
  } catch (error) { next(error); }
});

app.use((_req, res) => res.status(404).json({ error: 'Маршрут не знайдено.' }));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API request failed');
  if (error instanceof SyntaxError) { res.status(400).json({ error: 'Некоректний JSON.' }); return; }
  res.status(500).json({ error: 'Внутрішня помилка сервера.' });
});

const server = app.listen(port, () => console.log(`API listening on port ${port}`));
const shutdown = () => server.close(() => { void prisma.$disconnect().finally(() => pool.end()); });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
