const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const db = require('./db');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

function readUsers(){
  try{
    const raw = fs.readFileSync(USERS_FILE,'utf8');
    return JSON.parse(raw || '[]');
  }catch(e){
    return [];
  }
}

function writeUsers(users){
  fs.writeFileSync(USERS_FILE, JSON.stringify(users,null,2),'utf8');
}

app.post('/api/register', async (req,res)=>{
  try{
    const {username,password} = req.body || {};
    console.log('REGISTER attempt for:', username);
    if(!username || !password) return res.status(400).json({error:'username and password required'});
    // prefer DB if available
    if(db && db.available){
      const existing = db.getUserByUsername(username);
      if(existing){
        console.warn('REGISTER failed - user exists (db):', username);
        return res.status(409).json({error:'user exists'});
      }
      const hash = await bcrypt.hash(password, 10);
      const user = {id:Date.now(),username,passwordHash:hash,createdAt:new Date().toISOString()};
      db.createUser(user);
      const token = jwt.sign({id:user.id,username:user.username}, JWT_SECRET, {expiresIn:'7d'});
      console.log('REGISTER success for (db):', username);
      return res.json({token,username:user.username});
    }
    // fallback to file store
    const users = readUsers();
    if(users.find(u=>u.username===username)){
      console.warn('REGISTER failed - user exists:', username);
      return res.status(409).json({error:'user exists'});
    }
    const hash = await bcrypt.hash(password, 10);
    const user = {id:Date.now(),username,passwordHash:hash,createdAt:new Date().toISOString()};
    users.push(user);
    writeUsers(users);
    const token = jwt.sign({id:user.id,username:user.username}, JWT_SECRET, {expiresIn:'7d'});
    console.log('REGISTER success for:', username);
    res.json({token,username:user.username});
  }catch(err){
    console.error('REGISTER error:', err && err.stack ? err.stack : err);
    res.status(500).json({error:'server error', detail: String(err && err.message ? err.message : err)});
  }
});

app.post('/api/login', async (req,res)=>{
  try{
    const {username,password} = req.body || {};
    console.log('LOGIN attempt for:', username);
    if(!username || !password) return res.status(400).json({error:'username and password required'});
    if(db && db.available){
      const user = db.getUserByUsername(username);
      if(!user){
        console.warn('LOGIN failed - user not found (db):', username);
        return res.status(401).json({error:'invalid credentials'});
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if(!ok){
        console.warn('LOGIN failed - bad password for (db):', username);
        return res.status(401).json({error:'invalid credentials'});
      }
      const token = jwt.sign({id:user.id,username:user.username}, JWT_SECRET, {expiresIn:'7d'});
      console.log('LOGIN success for (db):', username);
      return res.json({token,username:user.username});
    }
    const users = readUsers();
    const user = users.find(u=>u.username===username);
    if(!user){
      console.warn('LOGIN failed - user not found:', username);
      return res.status(401).json({error:'invalid credentials'});
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok){
      console.warn('LOGIN failed - bad password for:', username);
      return res.status(401).json({error:'invalid credentials'});
    }
    const token = jwt.sign({id:user.id,username:user.username}, JWT_SECRET, {expiresIn:'7d'});
    console.log('LOGIN success for:', username);
    res.json({token,username:user.username});
  }catch(err){
    console.error('LOGIN error:', err && err.stack ? err.stack : err);
    res.status(500).json({error:'server error', detail: String(err && err.message ? err.message : err)});
  }
});

// record an attempt: {category, score}
app.post('/api/attempt', (req,res)=>{
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if(!m) return res.status(401).json({error:'missing token'});
  try{
    const payload = jwt.verify(m[1], JWT_SECRET);
    const {category, score, total} = req.body || {};
    if(!category || typeof score !== 'number') return res.status(400).json({error:'category and numeric score required'});
    const now = new Date().toISOString();
    if(db && db.available){
      db.addAttempt({user_id: payload.id, category, score, total: typeof total === 'number' ? total : null, createdAt: now});
      return res.json({ok:true});
    }
    // fallback: append to users.json with a per-user attempts array (non ideal)
    try{
      const users = readUsers();
  const user = users.find(u=> String(u.id) === String(payload.id));
      if(!user) return res.status(404).json({error:'user not found'});
  user.attempts = user.attempts || [];
  user.attempts.push({category,score,total: typeof total === 'number' ? total : null,createdAt:now});
      writeUsers(users);
      return res.json({ok:true, note:'saved to users.json'});
    }catch(e){
      return res.status(500).json({error:'failed to save attempt', detail: String(e && e.message ? e.message : e)});
    }
  }catch(e){
    return res.status(401).json({error:'invalid token'});
  }
});

// get attempts for logged-in user
app.get('/api/attempts/me', (req,res)=>{
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if(!m) return res.status(401).json({error:'missing token'});
  try{
    const payload = jwt.verify(m[1], JWT_SECRET);
    if(db && db.available){
      const rows = db.getAttemptsByUserId(payload.id);
      return res.json({attempts: rows});
    }
    // fallback: read from users.json
    const users = readUsers();
  const user = users.find(u=> String(u.id) === String(payload.id));
    if(!user) return res.status(404).json({error:'user not found'});
  // Ensure older attempts have a 'total' field. Default to 5 for legacy records (quizzes now have 5 questions)
    try{
      user.attempts = user.attempts || [];
      let updated = false;
      for(const a of user.attempts){
        if(a.total === undefined || a.total === null){
          a.total = 5;
          updated = true;
        }
      }
      if(updated){
        // persist back to users.json so future reads include totals
        writeUsers(users);
      }
    }catch(e){ console.warn('Failed to backfill attempt totals', e && e.message ? e.message : e); }
    return res.json({attempts: user.attempts || []});
  }catch(e){
    return res.status(401).json({error:'invalid token'});
  }
});

// clear attempts for logged-in user
app.post('/api/attempts/clear', (req,res)=>{
  console.log('Received request: POST /api/attempts/clear');
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if(!m) return res.status(401).json({error:'missing token'});
  try{
    const payload = jwt.verify(m[1], JWT_SECRET);
    if(db && db.available){
      const info = db.deleteAttemptsByUserId(payload.id);
      return res.json({ok:true, deleted: info && info.changes ? info.changes : 0});
    }
    // fallback: clear attempts array in users.json
    try{
      const users = readUsers();
  const user = users.find(u=> String(u.id) === String(payload.id));
      if(!user) return res.status(404).json({error:'user not found'});
      const before = (user.attempts && user.attempts.length) || 0;
      user.attempts = [];
      writeUsers(users);
      return res.json({ok:true, deleted: before, note:'cleared in users.json'});
    }catch(e){
      return res.status(500).json({error:'failed to clear attempts', detail: String(e && e.message ? e.message : e)});
    }
  }catch(e){
    return res.status(401).json({error:'invalid token'});
  }
});

// simple endpoint to verify token
app.get('/api/me', (req,res)=>{
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if(!m) return res.status(401).json({error:'missing token'});
  try{
    const payload = jwt.verify(m[1], JWT_SECRET);
    res.json({user:payload});
  }catch(e){
    res.status(401).json({error:'invalid token'});
  }
});

app.get('/api/ping', (req,res)=>{
  res.json({ok:true, time:new Date().toISOString()});
});

const server = app.listen(PORT, ()=>console.log('Server listening on port',PORT));
server.on('error', (err)=>{
  if(err && err.code === 'EADDRINUSE'){
    console.error('FATAL: Port',PORT,'is already in use. Quit any process using that port or set PORT env var to another port.');
    process.exit(1);
  }
  console.error('Server error', err);
  process.exit(1);
});
