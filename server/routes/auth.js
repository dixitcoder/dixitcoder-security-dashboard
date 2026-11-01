import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { hashPassword, isValidUsername, loadUsers, saveUsers, verifyPassword } from '../lib/userStore.js';

const router = Router();
const SESSION_COOKIE = 'dixitcoder_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const revokedSessions = new Map();
const SERVER_STARTED_AT = Date.now();

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signSession(payload) {
  return createHmac('sha256', process.env.AUTH_SESSION_SECRET)
    .update(payload)
    .digest('base64url');
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
  };
}

function getSessionToken(req) {
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.slice(SESSION_COOKIE.length + 1);
}

function readSession(req) {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  const token = getSessionToken(req);
  if (!token) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;
  if (!safeEqual(signature, signSession(encodedPayload))) return null;

  let session;
  try {
    session = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
  } catch {
    return null;
  }
  if (
    typeof session.userId !== 'string'
    || typeof session.id !== 'string'
    || !Number.isInteger(session.issuedAt)
    || session.issuedAt < SERVER_STARTED_AT
    || session.issuedAt > Date.now()
    || !Number.isInteger(session.expiresAt)
    || session.expiresAt <= Date.now()
    || revokedSessions.has(session.id)
  ) return null;

  const user = loadUsers().find((candidate) => candidate.id === session.userId && candidate.active);
  return user ? { ...session, user } : null;
}

function requireAdmin(req, res, next) {
  if (req.authUser?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  return next();
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    department: user.department || '',
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  };
}

router.post('/login', (req, res) => {
  if (!process.env.AUTH_SESSION_SECRET || process.env.AUTH_SESSION_SECRET.length < 32) {
    return res.status(503).json({ error: 'Authentication is not configured on the server' });
  }
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!username || !password || password.length > 1024) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = loadUsers();
  const user = users.find((candidate) => candidate.username.toLowerCase() === username.toLowerCase());
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const keepLoggedIn = req.body?.keepLoggedIn === true;
  const expiresInSeconds = keepLoggedIn ? 60 * 60 * 24 * 30 : SESSION_TTL_SECONDS;
  for (const [sessionId, expiresAt] of revokedSessions) {
    if (expiresAt <= Date.now()) revokedSessions.delete(sessionId);
  }
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    id: randomBytes(16).toString('base64url'),
    issuedAt: Date.now(),
    expiresAt: Date.now() + expiresInSeconds * 1000,
  })).toString('base64url');
  res.cookie(SESSION_COOKIE, `${payload}.${signSession(payload)}`, {
    ...sessionCookieOptions(),
    maxAge: expiresInSeconds * 1000,
  });
  return res.json({ user: publicUser(user) });
});

router.get('/me', requireAuthenticatedSession, (req, res) => {
  if (!req.authUser) return res.status(401).json({ error: 'Not signed in' });
  return res.json({ user: publicUser(req.authUser) });
});

router.post('/logout', requireAuthenticatedSession, (req, res) => {
  const session = req.authSession;
  if (session) revokedSessions.set(session.id, session.expiresAt);
  const { httpOnly, secure, sameSite, path } = sessionCookieOptions();
  res.clearCookie(SESSION_COOKIE, { httpOnly, secure, sameSite, path });
  return res.status(204).end();
});

router.get('/users', requireAuthenticatedSession, requireAdmin, (_req, res) => {
  return res.json({ users: loadUsers().map(publicUser) });
});

router.post('/users', requireAuthenticatedSession, requireAdmin, (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  const department = typeof req.body?.department === 'string' ? req.body.department.trim() : '';
  const role = req.body?.role;
  if (!isValidUsername(username)) {
    return res.status(400).json({ error: 'Username must be 3–32 letters, numbers, underscores, or hyphens.' });
  }
  if (password.length < 8 || password.length > 1024) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }
  if (!fullName || fullName.length > 100) {
    return res.status(400).json({ error: 'Full name is required and must be 100 characters or fewer.' });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address (up to 254 characters).' });
  }
  if (!phone || phone.length > 32) {
    return res.status(400).json({ error: 'Phone is required and must be 32 characters or fewer.' });
  }
  if (!department || department.length > 100) {
    return res.status(400).json({ error: 'Department is required and must be 100 characters or fewer.' });
  }
  if (role !== 'admin' && role !== 'user') {
    return res.status(400).json({ error: 'Choose either the Admin or User role.' });
  }

  const users = loadUsers();
  if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'That username is already in use.' });
  }

  const user = {
    id: randomBytes(16).toString('base64url'),
    username,
    fullName,
    email,
    phone,
    department,
    role,
    passwordHash: hashPassword(password),
    active: true,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return res.status(201).json({ user: publicUser(user) });
});

router.patch('/users/:id', requireAuthenticatedSession, requireAdmin, (req, res) => {
  const users = loadUsers();
  const target = users.find((user) => user.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found.' });

  const updates = req.body || {};
  const hasRole = Object.hasOwn(updates, 'role');
  const hasActive = Object.hasOwn(updates, 'active');
  const profileFields = ['fullName', 'email', 'phone', 'department'];
  const profileUpdates = profileFields.filter((field) => Object.hasOwn(updates, field));
  if (!hasRole && !hasActive && !profileUpdates.length) {
    return res.status(400).json({ error: 'Provide profile details, a role, or active status to update.' });
  }
  if (hasRole && updates.role !== 'admin' && updates.role !== 'user') {
    return res.status(400).json({ error: 'Choose either the Admin or User role.' });
  }
  if (hasActive && typeof updates.active !== 'boolean') {
    return res.status(400).json({ error: 'Active status must be true or false.' });
  }
  for (const field of profileUpdates) {
    if (typeof updates[field] !== 'string' || !updates[field].trim()) {
      return res.status(400).json({ error: `${field} is required.` });
    }
    const value = updates[field].trim();
    if (field === 'fullName' && value.length > 100) {
      return res.status(400).json({ error: 'Full name must be 100 characters or fewer.' });
    }
    if (field === 'email' && (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
      return res.status(400).json({ error: 'Enter a valid email address (up to 254 characters).' });
    }
    if (field === 'phone' && value.length > 32) {
      return res.status(400).json({ error: 'Phone must be 32 characters or fewer.' });
    }
    if (field === 'department' && value.length > 100) {
      return res.status(400).json({ error: 'Department must be 100 characters or fewer.' });
    }
  }

  if (target.id === req.authUser.id && ((hasRole && updates.role !== 'admin') || (hasActive && !updates.active))) {
    return res.status(400).json({ error: 'You cannot remove your own administrator access or disable your account.' });
  }
  const willRemoveAdmin = target.role === 'admin'
    && ((hasRole && updates.role !== 'admin') || (hasActive && !updates.active));
  if (willRemoveAdmin && !users.some((user) => user.id !== target.id && user.role === 'admin' && user.active)) {
    return res.status(400).json({ error: 'At least one active administrator must remain.' });
  }

  if (hasRole) target.role = updates.role;
  if (hasActive) target.active = updates.active;
  for (const field of profileUpdates) target[field] = updates[field].trim();
  saveUsers(users);
  return res.json({ user: publicUser(target) });
});

export default router;

export function requireAuthenticatedSession(req, res, next) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Authentication required' });
  req.authSession = session;
  req.authUser = session.user;
  return next();
}
