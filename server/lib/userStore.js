import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { chmodSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIRECTORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data');
const USERS_FILE = path.join(DATA_DIRECTORY, 'users.json');
const PASSWORD_HASH_PATTERN = /^scrypt\$[a-f0-9]{32,128}\$[a-f0-9]{128}$/i;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/;

function seedAdmin() {
  const [algorithm, salt, hash] = (process.env.AUTH_PASSWORD_HASH || '').split('$');
  const username = process.env.AUTH_USERNAME?.trim();
  if (
    !username
    || algorithm !== 'scrypt'
    || !salt
    || !/^[a-f0-9]{128}$/i.test(hash || '')
  ) {
    throw new Error('Set a valid AUTH_USERNAME and scrypt AUTH_PASSWORD_HASH before starting user management.');
  }

  return {
    id: randomUUID(),
    username,
    fullName: '',
    email: '',
    phone: '',
    department: '',
    role: 'admin',
    passwordHash: `scrypt$${salt}$${hash}`,
    active: true,
    createdAt: new Date().toISOString(),
  };
}

function writeUsers(users) {
  mkdirSync(DATA_DIRECTORY, { recursive: true, mode: 0o700 });
  const temporaryFile = `${USERS_FILE}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
  writeFileSync(temporaryFile, `${JSON.stringify(users, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
  renameSync(temporaryFile, USERS_FILE);
}

export function loadUsers() {
  mkdirSync(DATA_DIRECTORY, { recursive: true, mode: 0o700 });
  chmodSync(DATA_DIRECTORY, 0o700);
  let content;
  try {
    content = readFileSync(USERS_FILE, 'utf8');
    chmodSync(USERS_FILE, 0o600);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const initialUsers = [seedAdmin()];
    writeUsers(initialUsers);
    return initialUsers;
  }

  const users = JSON.parse(content);
  if (
    !Array.isArray(users)
    || users.some((user) => (
      !user
      || typeof user.id !== 'string'
      || typeof user.username !== 'string'
      || !['admin', 'user'].includes(user.role)
      || typeof user.active !== 'boolean'
      || typeof user.createdAt !== 'string'
      || (user.fullName !== undefined && typeof user.fullName !== 'string')
      || (user.email !== undefined && typeof user.email !== 'string')
      || (user.phone !== undefined && typeof user.phone !== 'string')
      || (user.department !== undefined && typeof user.department !== 'string')
      || !PASSWORD_HASH_PATTERN.test(user.passwordHash)
    ))
  ) {
    throw new Error('The user database has an invalid format.');
  }
  return users;
}

export function saveUsers(users) {
  writeUsers(users);
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || !PASSWORD_HASH_PATTERN.test(storedHash || '')) return false;
  const [, salt, hash] = storedHash.split('$');
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isValidUsername(username) {
  return USERNAME_PATTERN.test(username);
}
