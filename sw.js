const CACHE = 'coherence-cache-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './gong.wav',
  './manifest.json'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(res=>res || fetch(e.request)));
});