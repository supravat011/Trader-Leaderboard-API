import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DEMO_USER = {
  username: process.env.DEMO_USERNAME || 'admin',
  // bcrypt hash of 'password' if not provided via env
  passwordHash:
    process.env.DEMO_PASSWORD_HASH || bcrypt.hashSync(process.env.DEMO_PASSWORD || 'password', 8),
};

export function issueToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  req.user = decoded;
  next();
}

export function handleLogin(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const isMatch = username === DEMO_USER.username && bcrypt.compareSync(password, DEMO_USER.passwordHash);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
  const token = issueToken({ sub: username });
  res.json({ token });
}

export default {
  issueToken,
  verifyToken,
  authMiddleware,
  handleLogin,
};
