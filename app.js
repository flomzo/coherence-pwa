/* Elements */
const btn=document.getElementById('toggle');
const input=document.getElementById('durationInput');
const circle=document.getElementById('circle');
const cd=document.getElementById('countdown');
const swBtn=document.getElementById('soundToggle');

/* Trial */
const TRIAL_DAYS=7, KEY='trialStart', UNLOCK='trialUnlocked';
function daysLeft(){
  if(localStorage.getItem(UNLOCK)==='1') return Infinity;
  let s=localStorage.getItem(KEY);
  if(!s){s=Date.now();localStorage.setItem(KEY,s);}
  return Math.max(0,TRIAL_DAYS-Math.floor((Date.now()-Number(s))/86_400_000));
}
function expired(){return daysLeft()===0;}
function showTrial(){
  const b=document.getElementById('trialBanner');
  if(expired()){
    b.textContent='Version d\'essai terminée — merci !';
    btn.disabled=true;btn.classList.add('disabled');
  }else{
    b.textContent='Essai : '+daysLeft()+' jour(s) restants';
  }
}

/* Audio Web API */
let ctx, buf;
(async()=>{
  ctx=new (window.AudioContext||webkitAudioContext)();
  buf=await ctx.decodeAudioData(await fetch('gong.wav').then(r=>r.arrayBuffer()));
})();
let soundOn=true;
function updateSwitch(){ swBtn.setAttribute('aria-checked',soundOn);}
swBtn.addEventListener('click',()=>{soundOn=!soundOn;updateSwitch();});
swBtn.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();soundOn=!soundOn;updateSwitch();}});
function gong(){
  if(!soundOn||!buf) return;
  if(ctx.state==='suspended') ctx.resume();
  const src=ctx.createBufferSource(); src.buffer=buf; src.connect(ctx.destination); src.start();
}

/* Breathing */
const IN=5000, EX=5000;
let inhTO, exTO;
function inhale(){circle.style.transform='scale(1.3)';gong();inhTO=setTimeout(exhale,IN);}
function exhale(){circle.style.transform='scale(1)';gong();exTO=setTimeout(inhale,EX);}

/* Countdown */
let end,tick;
const pad=n=>n<10?'0'+n:n;
function clamp(v){return Math.max(1,Math.min(20,Math.round(isNaN(v)?5:v)));}
function upd(reset=false){
  if(reset){const m=clamp(+input.value);cd.textContent=pad(m)+':00';return;}
  const d=end-Date.now();if(d<=0){stop();return;}
  const s=Math.round(d/1000);cd.textContent=pad(Math.floor(s/60))+':'+pad(s%60);
}

/* Control */
let running=false;
function start(){
  if(expired()) return;
  const m=clamp(+input.value);input.value=m;
  end=Date.now()+m*60000;
  inhale();tick=setInterval(()=>upd(),1000);
  upd();running=true;btn.textContent='Stop';
}
function stop(){
  clearTimeout(inhTO);clearTimeout(exTO);clearInterval(tick);
  circle.style.transform='scale(1)';running=false;btn.textContent='Démarrer';upd(true);
}
btn.addEventListener('click',()=>running?stop():start());

/* Init */
window.addEventListener('beforeunload',()=>localStorage.setItem('dur',input.value));
input.value=localStorage.getItem('dur')||5;
upd(true);showTrial();updateSwitch();

/* SW */
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js');}