
const btn=document.getElementById('toggle');
const input=document.getElementById('durationInput');
const circle=document.getElementById('circle');
const cd=document.getElementById('countdown');
const sw=document.getElementById('soundToggle');

let ctx,gongBuf;
(async()=>{
  ctx=new (window.AudioContext||webkitAudioContext)();
  const buf=await fetch('gong.wav').then(r=>r.arrayBuffer());
  gongBuf=await ctx.decodeAudioData(buf);
})();
let soundOn=true;
sw.addEventListener('click',()=>{soundOn=!soundOn;sw.setAttribute('aria-checked',soundOn);});
function gong(){
  if(!soundOn||!gongBuf) return;
  if(ctx.state==='suspended') ctx.resume();
  const s=ctx.createBufferSource();s.buffer=gongBuf;s.connect(ctx.destination);s.start();
}

const IN=5000,EX=5000;
let inhTO,exTO,tickTO,running=false,endTime;
function inhale(){circle.style.transform='scale(1.3)';gong();inhTO=setTimeout(exhale,IN);}
function exhale(){circle.style.transform='scale(1)';gong();exTO=setTimeout(inhale,EX);}
const pad=n=>n<10?'0'+n:n;
const clamp=v=>Math.max(1,Math.min(20,Math.round(isNaN(v)?5:v)));
function upd(reset=false){
  if(reset){const m=clamp(+input.value);cd.textContent=pad(m)+':00';return;}
  const d=endTime-Date.now();if(d<=0){stop();return;}
  const s=Math.round(d/1000);cd.textContent=pad(Math.floor(s/60))+':'+pad(s%60);
}
function start(){
  const m=clamp(+input.value);input.value=m;
  endTime=Date.now()+m*60000;
  inhale();tickTO=setInterval(()=>upd(),1000);upd();running=true;btn.textContent='Stop';
}
function stop(){
  clearTimeout(inhTO);clearTimeout(exTO);clearInterval(tickTO);
  circle.style.transform='scale(1)';running=false;btn.textContent='Démarrer';upd(true);
}
btn.addEventListener('click',()=>running?stop():start());
window.addEventListener('beforeunload',()=>localStorage.setItem('dur',input.value));
input.value=localStorage.getItem('dur')||5;upd(true);
if('serviceWorker'in navigator) navigator.serviceWorker.register('sw.js');
