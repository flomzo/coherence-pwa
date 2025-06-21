const btn = document.getElementById('toggle');
const durationInput = document.getElementById('durationInput');
const circle = document.getElementById('circle');
const countdownEl = document.getElementById('countdown');
const soundToggle = document.getElementById('soundToggle');

let soundOn = true;
function updateSwitch(){ soundToggle.setAttribute('aria-checked', soundOn); }
soundToggle.addEventListener('click', ()=>{ soundOn = !soundOn; updateSwitch(); });
soundToggle.addEventListener('keydown', e=>{
  if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); soundOn = !soundOn; updateSwitch(); }
});

const gong = new Audio('gong.wav'); gong.preload='auto';
function playGong(){ if(soundOn){ try{ gong.currentTime = 0; gong.play().catch(()=>{});}catch{} } }

const IN_MS = 5000, EX_MS = 5000, CYCLE_MS = IN_MS + EX_MS;
let running = false, endTime, cycleTimer, tickTimer;

function pad(n){ return n<10 ? '0'+n : n; }
function clamp(v){ if(isNaN(v)) return 5; return Math.max(1, Math.min(20, Math.round(v))); }

function updateCountdown(reset=false){
  if(reset){
    const m = clamp(+durationInput.value);
    countdownEl.textContent = pad(m)+':00';
    return;
  }
  const diff = endTime - Date.now();
  if(diff <= 0){ stopSession(); return; }
  const sec = Math.round(diff/1000);
  const m = Math.floor(sec/60), s = sec % 60;
  countdownEl.textContent = pad(m)+':'+pad(s);
}

function breathe(){
  circle.style.transform = 'scale(1.3)';
  playGong();
  setTimeout(()=>{ circle.style.transform='scale(1)'; playGong(); }, IN_MS);
}

function startSession(){
  const minutes = clamp(+durationInput.value);
  durationInput.value = minutes;
  endTime = Date.now() + minutes*60000;
  breathe();
  cycleTimer = setInterval(breathe, CYCLE_MS);
  tickTimer = setInterval(()=>updateCountdown(), 1000);
  updateCountdown();
  btn.textContent = 'Stop';
  running = true;
}

function stopSession(){
  clearInterval(cycleTimer);
  clearInterval(tickTimer);
  circle.style.transform='scale(1)';
  btn.textContent = 'Démarrer';
  running = false;
  updateCountdown(true);
}

btn.addEventListener('click', ()=> running ? stopSession() : startSession() );

window.addEventListener('beforeunload', ()=> localStorage.setItem('dur', durationInput.value) );
durationInput.value = localStorage.getItem('dur') || 5;
updateCountdown(true);

// Service worker registration
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js');
}