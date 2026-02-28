const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const indexPath = path.join(PUBLIC_DIR, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('\n  ⚠️  public/index.html not found!');
  console.error(`  Expected at: ${indexPath}`);
  console.error('\n  Folder structure needed:');
  console.error('    star-maths/');
  console.error('      server.js');
  console.error('      public/');
  console.error('        index.html\n');
  process.exit(1);
}

// ── Sessions ─────────────────────────────────────
const sessions = {};
function getSession(req) {
  const cookies = (req.headers.cookie || '').split(';').reduce((a, c) => {
    const [k, v] = c.trim().split('='); if (k && v) a[k] = v; return a;
  }, {});
  return (cookies.sm_sid && sessions[cookies.sm_sid]) ? sessions[cookies.sm_sid] : null;
}
function createSession(res) {
  const sid = crypto.randomBytes(24).toString('hex');
  sessions[sid] = {};
  res.setHeader('Set-Cookie', `sm_sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  return sessions[sid];
}

// ── 36 Characters ────────────────────────────────
const CHARACTERS = [
  { id:'astro-cat',       emoji:'🐱', name:'Astro Cat',        bg:'#f97316' },
  { id:'cosmic-fox',      emoji:'🦊', name:'Cosmic Fox',       bg:'#ea580c' },
  { id:'star-wolf',       emoji:'🐺', name:'Star Wolf',        bg:'#6366f1' },
  { id:'nebula-bear',     emoji:'🐻', name:'Nebula Bear',      bg:'#a855f7' },
  { id:'rocket-bunny',    emoji:'🐰', name:'Rocket Bunny',     bg:'#ec4899' },
  { id:'lunar-panda',     emoji:'🐼', name:'Lunar Panda',      bg:'#64748b' },
  { id:'galaxy-lion',     emoji:'🦁', name:'Galaxy Lion',       bg:'#eab308' },
  { id:'comet-tiger',     emoji:'🐯', name:'Comet Tiger',       bg:'#f59e0b' },
  { id:'orbit-owl',       emoji:'🦉', name:'Orbit Owl',         bg:'#8b5cf6' },
  { id:'solar-eagle',     emoji:'🦅', name:'Solar Eagle',       bg:'#0ea5e9' },
  { id:'meteor-monkey',   emoji:'🐵', name:'Meteor Monkey',     bg:'#d97706' },
  { id:'void-dragon',     emoji:'🐉', name:'Void Dragon',       bg:'#dc2626' },
  { id:'plasma-penguin',  emoji:'🐧', name:'Plasma Penguin',    bg:'#0284c7' },
  { id:'quasar-koala',    emoji:'🐨', name:'Quasar Koala',      bg:'#7c3aed' },
  { id:'pulsar-dolphin',  emoji:'🐬', name:'Pulsar Dolphin',    bg:'#06b6d4' },
  { id:'warp-whale',      emoji:'🐋', name:'Warp Whale',        bg:'#2563eb' },
  { id:'nova-unicorn',    emoji:'🦄', name:'Nova Unicorn',      bg:'#d946ef' },
  { id:'turbo-turtle',    emoji:'🐢', name:'Turbo Turtle',      bg:'#16a34a' },
  { id:'blaze-bee',       emoji:'🐝', name:'Blaze Bee',         bg:'#ca8a04' },
  { id:'flare-frog',      emoji:'🐸', name:'Flare Frog',        bg:'#22c55e' },
  { id:'zenith-zebra',    emoji:'🦓', name:'Zenith Zebra',      bg:'#78716c' },
  { id:'dark-bat',        emoji:'🦇', name:'Dark Matter Bat',   bg:'#581c87' },
  { id:'hyper-hamster',   emoji:'🐹', name:'Hyper Hamster',     bg:'#fb923c' },
  { id:'gravity-gorilla', emoji:'🦍', name:'Gravity Gorilla',   bg:'#57534e' },
  { id:'spark-shark',     emoji:'🦈', name:'Spark Shark',       bg:'#475569' },
  { id:'thunder-rex',     emoji:'🦖', name:'Thunder Rex',       bg:'#65a30d' },
  { id:'photon-phoenix',  emoji:'🔥', name:'Photon Phoenix',    bg:'#ef4444' },
  { id:'astro-alien',     emoji:'👾', name:'Astro Alien',       bg:'#84cc16' },
  { id:'robo-ranger',     emoji:'🤖', name:'Robo Ranger',       bg:'#94a3b8' },
  { id:'captain-croc',    emoji:'🐊', name:'Captain Croc',      bg:'#15803d' },
  { id:'eclipse-elk',     emoji:'🦌', name:'Eclipse Elk',       bg:'#b45309' },
  { id:'dash-dog',        emoji:'🐶', name:'Dash Dog',          bg:'#a16207' },
  { id:'space-kitten',    emoji:'😺', name:'Space Kitten',      bg:'#e879f9' },
  { id:'star-sloth',      emoji:'🦥', name:'Star Sloth',        bg:'#a8a29e' },
  { id:'jet-jellyfish',   emoji:'🪼', name:'Jet Jellyfish',     bg:'#c084fc' },
  { id:'astro-octopus',   emoji:'🐙', name:'Astro Octopus',     bg:'#e11d48' },
];

// ── 10 Levels (all open) ────────────────────────
const LEVELS = [
  { id:1,  name:'Tiny Astronaut',      age:'4-5',  ops:['+'],                   maxNum:5,   time:30, count:8,  fractions:false, brackets:false, multiplier:1.0 },
  { id:2,  name:'Moon Hopper',         age:'4-5',  ops:['+','-'],               maxNum:10,  time:25, count:10, fractions:false, brackets:false, multiplier:1.2 },
  { id:3,  name:'Star Collector',      age:'5-6',  ops:['+','-'],               maxNum:20,  time:20, count:10, fractions:false, brackets:false, multiplier:1.5 },
  { id:4,  name:'Rocket Pilot',        age:'6-7',  ops:['+','-','×'],           maxNum:12,  time:20, count:12, fractions:false, brackets:false, multiplier:1.8 },
  { id:5,  name:'Planet Explorer',     age:'7-8',  ops:['+','-','×','÷'],       maxNum:12,  time:15, count:12, fractions:false, brackets:false, multiplier:2.2 },
  { id:6,  name:'Asteroid Miner',      age:'7-8',  ops:['+','-','×','÷'],       maxNum:50,  time:15, count:14, fractions:false, brackets:false, multiplier:2.6 },
  { id:7,  name:'Nebula Navigator',    age:'8-9',  ops:['+','-','×','÷'],       maxNum:100, time:12, count:14, fractions:true,  brackets:false, multiplier:3.0 },
  { id:8,  name:'Galaxy Guardian',     age:'8-9',  ops:['+','-','×','÷'],       maxNum:100, time:12, count:15, fractions:true,  brackets:true,  multiplier:3.5 },
  { id:9,  name:'Supernova Scientist', age:'9-10', ops:['+','-','×','÷'],       maxNum:200, time:10, count:15, fractions:true,  brackets:true,  multiplier:4.0 },
  { id:10, name:'Universe Commander',  age:'9-10', ops:['+','-','×','÷'],       maxNum:500, time:10, count:18, fractions:true,  brackets:true,  multiplier:5.0 },
];

// ── Scoring ──────────────────────────────────────
function calculateScore(level, results) {
  const cfg = LEVELS[level - 1];
  let total = 0, streak = 0, bestStreak = 0;
  results.forEach(r => {
    if (r.correct) {
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      const speed = Math.min(Math.max(r.timeAllowed / Math.max(r.timeTaken, 0.5), 0.5), 3.0);
      const streakBonus = Math.min(streak - 1, 10) * 50;
      total += Math.round((100 * cfg.multiplier * speed) + (streakBonus * cfg.multiplier));
    } else { streak = 0; }
  });
  const correctCount = results.filter(r => r.correct).length;
  let perfectBonus = 0;
  if (correctCount === results.length && results.length > 0) {
    perfectBonus = Math.round(500 * cfg.multiplier);
    total += perfectBonus;
  }
  const avgSpeed = results.filter(r => r.correct).reduce((s, r) => s + r.timeTaken, 0) / Math.max(correctCount, 1);
  return { totalScore: total, correctCount, totalQuestions: results.length, bestStreak, perfectBonus, avgSpeed: Math.round(avgSpeed * 10) / 10, multiplier: cfg.multiplier };
}

// ── Question generation ──────────────────────────
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

function generateQuestion(level) {
  const cfg = LEVELS[level - 1];
  if (!cfg) return null;
  if (cfg.fractions && Math.random() < 0.25) return genFrac(cfg);
  if (cfg.brackets && Math.random() < 0.25) return genBracket(cfg);
  const op = cfg.ops[rand(0, cfg.ops.length - 1)];
  let a, b, answer, display;
  switch (op) {
    case '+':  a = rand(1, cfg.maxNum); b = rand(1, cfg.maxNum); answer = a + b; display = `${a} + ${b}`; break;
    case '-':  a = rand(1, cfg.maxNum); b = rand(1, a); answer = a - b; display = `${a} − ${b}`; break;
    case '×':  a = rand(1, Math.min(cfg.maxNum, 12)); b = rand(1, Math.min(cfg.maxNum, 12)); answer = a * b; display = `${a} × ${b}`; break;
    case '÷':  b = rand(1, Math.min(cfg.maxNum, 12)); answer = rand(1, Math.min(cfg.maxNum, 12)); a = b * answer; display = `${a} ÷ ${b}`; break;
  }
  return { display, answer: String(answer), time: cfg.time };
}

function genFrac(cfg) {
  const type = rand(1, 3), dens = [2,3,4,5,6,8];
  if (type === 1) {
    const d = dens[rand(0,5)], a = rand(1, d-1), b = rand(1, d-1), n = a+b, g = gcd(n,d);
    let ans;
    if (n/g >= d/g) { const w = Math.floor(n/d), r = n%d; if(r===0) ans=String(w); else { const g2=gcd(r,d); ans=`${w} ${r/g2}/${d/g2}`; } }
    else ans = `${n/g}/${d/g}`;
    return { display:`<span class="frac"><span class="num">${a}</span><span class="den">${d}</span></span> + <span class="frac"><span class="num">${b}</span><span class="den">${d}</span></span>`, answer:ans, time:cfg.time+5, isFraction:true };
  }
  if (type === 2) {
    const d = dens[rand(0,5)], n = rand(1, d-1), g = gcd(n,d);
    return { display:`What fraction is <strong>${n}</strong> out of <strong>${d}</strong>?`, answer:`${n/g}/${d/g}`, time:cfg.time+5, isFraction:true };
  }
  const d = dens[rand(0,5)], a = rand(2, d-1), b = rand(1, a-1), n = a-b, g = gcd(n,d);
  return { display:`<span class="frac"><span class="num">${a}</span><span class="den">${d}</span></span> − <span class="frac"><span class="num">${b}</span><span class="den">${d}</span></span>`, answer:n===0?'0':`${n/g}/${d/g}`, time:cfg.time+5, isFraction:true };
}

function genBracket(cfg) {
  const T = [
    () => { const a=rand(1,10),b=rand(1,10),c=rand(2,5); return {display:`${c} × (${a} + ${b})`, answer:String(c*(a+b))}; },
    () => { const a=rand(5,20),b=rand(1,5),c=rand(1,5); return {display:`(${a} − ${b}) × ${c}`, answer:String((a-b)*c)}; },
    () => { const a=rand(2,10),b=rand(2,10),c=rand(1,5); return {display:`(${a} + ${b}) ÷ ${c}`, answer:String((a+b)/c)}; },
    () => { const a=rand(1,8),b=rand(1,8),c=rand(1,5); return {display:`${a} + (${b} × ${c})`, answer:String(a+b*c)}; },
  ];
  for (let i=0;i<20;i++) { const q=T[rand(0,T.length-1)](); const v=Number(q.answer); if(Number.isInteger(v)&&v>=0&&v<=1000) return {...q,time:cfg.time+5}; }
  const a=rand(2,5),b=rand(1,5),c=rand(1,5);
  return { display:`${a} × (${b} + ${c})`, answer:String(a*(b+c)), time:cfg.time+5 };
}

// ── Helpers ──────────────────────────────────────
function sendJSON(res, code, data) { res.writeHead(code, {'Content-Type':'application/json'}); res.end(JSON.stringify(data)); }
function readBody(req) { return new Promise(r => { let b=''; req.on('data',c=>b+=c); req.on('end',()=>{ try{r(JSON.parse(b))}catch{r({})} }); }); }
const MIME = { '.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon' };

// ── Leaderboard persistence ──────────────────────
const LB_FILE = path.join(DATA_DIR, 'leaderboard.json');
let leaderboard = {};
if (fs.existsSync(LB_FILE)) try { leaderboard = JSON.parse(fs.readFileSync(LB_FILE,'utf-8')); } catch { leaderboard = {}; }
function saveLB() { fs.writeFileSync(LB_FILE, JSON.stringify(leaderboard, null, 2)); }

// ── Server ───────────────────────────────────────
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname, m = req.method;

  if (p==='/api/characters' && m==='GET') return sendJSON(res, 200, CHARACTERS);
  if (p==='/api/levels'     && m==='GET') return sendJSON(res, 200, LEVELS);

  if (p==='/api/select-character' && m==='POST') {
    const {characterId} = await readBody(req);
    const ch = CHARACTERS.find(c=>c.id===characterId);
    if (!ch) return sendJSON(res,400,{error:'Unknown character'});
    const s = getSession(req)||createSession(res);
    s.character = ch;
    return sendJSON(res,200,{ok:true,character:ch});
  }

  if (p.startsWith('/api/questions/') && m==='GET') {
    const lv = parseInt(p.split('/').pop());
    if (lv<1||lv>LEVELS.length) return sendJSON(res,400,{error:'Invalid level'});
    const cfg = LEVELS[lv-1], qs = [];
    for (let i=0;i<cfg.count;i++) qs.push(generateQuestion(lv));
    return sendJSON(res,200,{level:cfg,questions:qs});
  }

  if (p==='/api/submit' && m==='POST') {
    const sess = getSession(req);
    const {level, results} = await readBody(req);
    if (!level||!results) return sendJSON(res,400,{error:'Missing data'});
    const score = calculateScore(level, results);
    const nm = sess?.character?.name||'Anonymous', em = sess?.character?.emoji||'👾';
    const key = `level_${level}`;
    if (!leaderboard[key]) leaderboard[key]=[];
    const entry = { name:nm, emoji:em, score:score.totalScore, correct:score.correctCount, total:score.totalQuestions, streak:score.bestStreak, avgSpeed:score.avgSpeed, date:new Date().toISOString() };
    leaderboard[key].push(entry);
    leaderboard[key].sort((a,b)=>b.score-a.score);
    leaderboard[key] = leaderboard[key].slice(0,50);
    saveLB();
    const rank = leaderboard[key].indexOf(entry)+1;
    return sendJSON(res,200,{score, rank, topScores: leaderboard[key].slice(0,10)});
  }

  if (p.startsWith('/api/leaderboard/') && m==='GET') {
    const lv = parseInt(p.split('/').pop());
    return sendJSON(res,200, leaderboard[`level_${lv}`]||[]);
  }

  // Static files
  let fp = path.resolve(path.join(PUBLIC_DIR, p==='/' ? 'index.html' : p));
  if (!fp.startsWith(path.resolve(PUBLIC_DIR))) { res.writeHead(403); return res.end('Forbidden'); }
  if (!fs.existsSync(fp)) { res.writeHead(404); return res.end('Not Found'); }
  try {
    if (fs.statSync(fp).isFile()) { res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'}); fs.createReadStream(fp).pipe(res); }
    else { res.writeHead(404); res.end('Not Found'); }
  } catch { res.writeHead(500); res.end('Error'); }
}).listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║       🚀  STAR MATHS  🚀            ║');
  console.log('  ║       Space Maths Adventure          ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  🌐  http://localhost:${PORT}`);
  console.log(`  🎭  ${CHARACTERS.length} characters`);
  console.log(`  🪐  ${LEVELS.length} levels (all open)`);
  console.log('');
});
