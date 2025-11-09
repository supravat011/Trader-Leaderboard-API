import { Router } from 'express';
import { upsertHigherScore, getTopLeaderboard, getRankAndScore } from './db.js';
import { authMiddleware, handleLogin } from './auth.js';

// simple in-memory cache for leaderboard
let cachedTop = null;
let cachedAt = 0;
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 5000);

const router = Router();

// Public login to get JWT (bonus)
router.post('/login', handleLogin);

// POST /api/scores - protected (bonus)
router.post('/scores', authMiddleware, (req, res) => {
  const { traderName, score } = req.body || {};
  if (!traderName || typeof traderName !== 'string') return res.status(400).json({ error: 'traderName required' });
  const parsedScore = Number(score);
  if (!Number.isFinite(parsedScore)) return res.status(400).json({ error: 'score must be a number' });

  const result = upsertHigherScore(traderName.trim(), Math.floor(parsedScore));
  // invalidate cache if score changed or created
  if (result.updated || result.created) {
    cachedTop = null;
    cachedAt = 0;
  }
  res.status(result.created ? 201 : 200).json({ name: result.name, score: result.score, updated: result.updated });
});

// GET /api/leaderboard - top 10 (with optional cache)
router.get('/leaderboard', (req, res) => {
  const now = Date.now();
  if (cachedTop && now - cachedAt < CACHE_TTL_MS) {
    return res.json(cachedTop);
  }
  const top = getTopLeaderboard(10);
  cachedTop = top;
  cachedAt = now;
  res.json(top);
});

// GET /api/rank/:traderName
router.get('/rank/:traderName', (req, res) => {
  const traderName = req.params.traderName;
  const info = getRankAndScore(traderName);
  if (!info) return res.status(404).json({ error: 'Trader not found' });
  res.json(info);
});

export default router;
