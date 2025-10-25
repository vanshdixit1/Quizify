const fs = require('fs');
const path = require('path');

let available = false;
let db = null;

try {
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, 'data.sqlite');
  db = new Database(dbPath);

  // create tables
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    passwordHash TEXT,
    createdAt TEXT
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    category TEXT,
    score INTEGER,
    total INTEGER,
    createdAt TEXT
  )`).run();

  // If attempts table exists from older version without 'total', add the column
  try{
    const info = db.prepare("PRAGMA table_info('attempts')").all();
    const hasTotal = info.some(c=>c.name === 'total');
    if(!hasTotal){
      db.prepare('ALTER TABLE attempts ADD COLUMN total INTEGER').run();
      console.log('Migrated attempts table: added total column');
    }
  }catch(e){ console.warn('Error checking attempts table schema', e && e.message ? e.message : e); }

  available = true;
  console.log('SQLite DB initialized at', dbPath);
} catch (err) {
  // better-sqlite3 not installed or failed to load — we'll gracefully fall back in server
  console.warn('SQLite (better-sqlite3) not available:', err && err.message ? err.message : err);
}

function getUserByUsername(username){
  if(!available) return null;
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function getUserById(id){
  if(!available) return null;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function createUser(user){
  if(!available) throw new Error('db not available');
  const stmt = db.prepare('INSERT INTO users (id,username,passwordHash,createdAt) VALUES (?,?,?,?)');
  return stmt.run(user.id, user.username, user.passwordHash, user.createdAt);
}

function addAttempt({user_id, category, score, total, createdAt}){
  if(!available) throw new Error('db not available');
  const stmt = db.prepare('INSERT INTO attempts (user_id,category,score,total,createdAt) VALUES (?,?,?,?,?)');
  return stmt.run(user_id, category, score, total || null, createdAt);
}

function getAttemptsByUserId(userId){
  if(!available) return [];
  return db.prepare('SELECT * FROM attempts WHERE user_id = ? ORDER BY createdAt DESC').all(userId);
}

function deleteAttemptsByUserId(userId){
  if(!available) return {changes:0};
  const stmt = db.prepare('DELETE FROM attempts WHERE user_id = ?');
  const info = stmt.run(userId);
  return info; // {changes: N, ...}
}

function migrateUsersFromJson(usersJsonPath){
  if(!available) return {migrated:0, reason:'db not available'};
  try{
    if(!fs.existsSync(usersJsonPath)) return {migrated:0, reason:'no users.json'};
    const raw = fs.readFileSync(usersJsonPath,'utf8');
    const users = JSON.parse(raw || '[]');
    const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    if(count > 0) return {migrated:0, reason:'users table not empty'};
    let migrated = 0;
    const insert = db.prepare('INSERT OR IGNORE INTO users (id,username,passwordHash,createdAt) VALUES (?,?,?,?)');
    const insertMany = db.transaction((rows)=>{
      for(const u of rows){
        insert.run(u.id, u.username, u.passwordHash, u.createdAt);
        migrated++;
      }
    });
    insertMany(users);
    return {migrated, reason:'ok'};
  }catch(e){
    return {migrated:0, reason: String(e && e.message ? e.message : e)};
  }
}

module.exports = {
  available,
  getUserByUsername,
  getUserById,
  createUser,
  addAttempt,
  getAttemptsByUserId,
  migrateUsersFromJson,
  deleteAttemptsByUserId,
};
