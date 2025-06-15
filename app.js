const btn=document.getElementById('toggle');
const input=document.getElementById('durationInput');
const circle=document.getElementById('circle');
const countdownEl=document.getElementById('countdown');
const soundToggle=document.getElementById('soundToggle');
let soundOn=true;
soundToggle.addEventListener('click',toggleSound);
soundToggle.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggleSound();}});
function toggleSound(){soundOn=!soundOn;soundToggle.setAttribute('aria-checked',soundOn);}
const gong=new Audio('gong.wav');gong.preload='auto';gong.volume=1;
function playGong(){if(soundOn){gong.currentTime=0;gong.play().catch(()=>{});}}
const IN=5000,EX=5000,CYCLE=IN+EX;
let running=false,endMs,cycleTimer,countTimer;
function pad(n){return n<10?'0'+n:n;}
function updateCountdown(reset=false){if(reset){const m=clamp(+input.value);countdownEl.textContent=`${pad(m)}:00`;return;}
  const diff=endMs-Date.now();if(diff<=0){stop();return;}const sec=Math.round(diff/1000);const m=Math.floor(sec/60),s=sec%60;countdownEl.textContent=`${pad(m)}:${pad(s)}`;}
function breathe(){circle.style.transform='scale(1.3)';playGong();setTimeout(()=>{circle.style.transform='scale(1)';playGong();},IN);}
function start(){const minutes=clamp(+input.value);input.value=minutes;endMs=Date.now()+minutes*60000;breathe();
  cycleTimer=setInterval(breathe,CYCLE);countTimer=setInterval(updateCountdown,1000);updateCountdown();
  running=true;btn.textContent='Stop';}
function stop(){clearInterval(cycleTimer);clearInterval(countTimer);circle.style.transform='scale(1)';running=false;btn.textContent='Démarrer';updateCountdown(true);}
function clamp(v){if(isNaN(v))return 5;return Math.max(1,Math.min(20,Math.round(v)));}

btn.addEventListener('click',()=>running?stop():start());
window.addEventListener('beforeunload',()=>localStorage.setItem('dur',input.value));
input.value=localStorage.getItem('dur')||5;updateCountdown(true);