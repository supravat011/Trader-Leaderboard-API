import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

// Use /tmp for Netlify (serverless) environment, otherwise use data directory
const isNetlify = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;
const databaseDirectory = isNetlify 
  ? '/tmp' 
  : path.resolve(process.cwd(), 'data');
const databaseFilePath = path.join(databaseDirectory, 'leaderboard.db');

if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true });
}

const db = new Database(databaseFilePath);
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS traders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    score INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_traders_score_desc ON traders(score DESC);
  CREATE INDEX IF NOT EXISTS idx_traders_name ON traders(name);
`);

export function upsertHigherScore(traderName, newScore) {
  const getStmt = db.prepare('SELECT id, score FROM traders WHERE name = ?');
  const row = getStmt.get(traderName);
  if (!row) {
    const insertStmt = db.prepare('INSERT INTO traders (name, score) VALUES (?, ?)');
    const info = insertStmt.run(traderName, newScore);
    return { id: info.lastInsertRowid, name: traderName, score: newScore, updated: true, created: true };
  }
  if (newScore > row.score) {
    const updateStmt = db.prepare('UPDATE traders SET score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    updateStmt.run(newScore, row.id);
    return { id: row.id, name: traderName, score: newScore, updated: true, created: false };
  }
  return { id: row.id, name: traderName, score: row.score, updated: false, created: false };
}

export function getTopLeaderboard(limit = 10) {
  const stmt = db.prepare('SELECT name, score FROM traders ORDER BY score DESC, updated_at ASC LIMIT ?');
  return stmt.all(limit);
}

export function getRankAndScore(traderName) {
  const scoreStmt = db.prepare('SELECT score FROM traders WHERE name = ?');
  const row = scoreStmt.get(traderName);
  if (!row) return null;
  const betterCountStmt = db.prepare('SELECT COUNT(*) as higher FROM traders WHERE score > ?');
  const { higher } = betterCountStmt.get(row.score);
  return { name: traderName, score: row.score, rank: higher + 1 };
}

export default db;
