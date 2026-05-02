// ZenReading Launcher — GUI control panel for the server
const { spawn } = require('child_process');
const express = require('express');
const path = require('path');

const LAUNCHER_PORT = 2999;
const APP_PORT = 3001;
const app = express();

let serverProcess = null;

app.use(express.json());

// ── Status ──
app.get('/api/status', (_req, res) => {
  res.json({ running: serverProcess !== null && !serverProcess.killed, appPort: APP_PORT });
});

// ── Start ──
app.post('/api/start', (_req, res) => {
  if (serverProcess && !serverProcess.killed) {
    return res.json({ ok: true, message: 'Already running' });
  }
  serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'pipe',
    detached: false,
  });
  serverProcess.stdout.on('data', (d) => process.stdout.write(`[app] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[app] ${d}`));
  serverProcess.on('close', () => { serverProcess = null; });
  serverProcess.on('error', () => { serverProcess = null; });
  res.json({ ok: true });
});

// ── Stop ──
app.post('/api/stop', (_req, res) => {
  if (!serverProcess || serverProcess.killed) {
    return res.json({ ok: true, message: 'Not running' });
  }
  // Graceful shutdown
  try {
    const http = require('http');
    http.get(`http://localhost:${APP_PORT}/api/shutdown`, () => {});
  } catch (_) {}
  // Force kill after timeout
  setTimeout(() => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
  }, 2000);
  serverProcess = null;
  res.json({ ok: true });
});

// ── Launcher UI ──
app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ZenReading</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;
  background:linear-gradient(135deg,#f9f6f0 0%,#eef5ee 100%);
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  -webkit-app-region:drag;user-select:none}
.card{text-align:center;padding:48px 40px}
h1{color:#7a9a7d;font-size:28px;font-weight:700;letter-spacing:2px;margin-bottom:4px}
.sub{color:#9e9688;font-size:13px;margin-bottom:40px}
.btns{display:flex;flex-direction:column;gap:12px;align-items:center}
.btn{padding:14px 0;width:240px;border:none;border-radius:10px;font-size:15px;font-weight:600;
  cursor:pointer;transition:all .15s;-webkit-app-region:no-drag;font-family:inherit}
.btn-start{background:#7a9a7d;color:#fff}
.btn-start:hover{background:#5a7a5d}
.btn-start.running{background:#e8e4dc;color:#9e9688;pointer-events:none}
.btn-stop{background:transparent;color:#e57373;border:1.5px solid #e8e4dc}
.btn-stop:hover{background:#fbe9e7}
.btn-stop:disabled{opacity:0.3;pointer-events:none}
.btn-open{background:transparent;color:#7a9a7d;border:1.5px solid #7a9a7d}
.btn-open:hover{background:#ecf2ec}
.btn-open:disabled{opacity:0.3;pointer-events:none}
.status{margin-top:24px;font-size:12px;min-height:18px}
.status .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.status .dot.on{background:#4caf50;box-shadow:0 0 6px rgba(76,175,80,.4)}
.status .dot.off{background:#ccc}
</style>
</head>
<body>
<div class="card">
  <h1>ZenReading</h1>
  <p class="sub">禅定阅读 · 沉浸式学习</p>
  <div class="btns">
    <button id="btnStart" class="btn btn-start" onclick="start()">Start Server</button>
    <button id="btnStop" class="btn btn-stop" disabled onclick="stop()">Stop Server</button>
    <button id="btnOpen" class="btn btn-open" disabled onclick="openApp()">Open App</button>
  </div>
  <div id="status" class="status"><span class="dot off"></span>Server stopped</div>
</div>
<script>
var running=false;
function poll(){fetch('/api/status').then(r=>r.json()).then(s=>{
  running=s.running;
  document.getElementById('btnStart').className='btn btn-start'+(running?' running':'');
  document.getElementById('btnStop').disabled=!running;
  document.getElementById('btnOpen').disabled=!running;
  document.getElementById('status').innerHTML=running
    ?'<span class="dot on"></span>Running on port '+s.appPort
    :'<span class="dot off"></span>Server stopped';
  setTimeout(poll,2000);
});}
function start(){fetch('/api/start',{method:'POST'}).then(()=>poll());}
function stop(){fetch('/api/stop',{method:'POST'}).then(()=>poll());}
function openApp(){window.open('http://localhost:${APP_PORT}','_blank');}
poll();
</script>
</body>
</html>`);
});

app.listen(LAUNCHER_PORT, () => {
  console.log(`Launcher on http://localhost:${LAUNCHER_PORT}`);
  const cmd = process.platform === 'darwin' ? 'open' : 'start';
  require('child_process').exec(`${cmd} http://localhost:${LAUNCHER_PORT}`);
});
