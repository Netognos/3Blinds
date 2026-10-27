// Tichu offline support (version 2026-10-26l). The game page is fetched fresh when online, so updates arrive by themselves;
// without internet the last saved copy starts. Fonts are cached once they have loaded.
const CACHE = 'tichu-2026-10-26l';
const CORE = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-180.png'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e=>{
  const req = e.request; if(req.method!=='GET') return;
  const url = new URL(req.url);
  if(req.mode==='navigate' || (url.origin===location.origin && url.pathname.endsWith('/index.html'))){
    e.respondWith(fetch(req).then(r=>{ const copy = r.clone(); caches.open(CACHE).then(c=>c.put('./index.html', copy)); return r; })
      .catch(()=>caches.match('./index.html')));
    return;
  }
  if(url.origin===location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(hit=>hit || fetch(req).then(r=>{ if(r.ok || r.type==='opaque'){ const copy = r.clone(); caches.open(CACHE).then(c=>c.put(req, copy)); } return r; })));
  }
  // everything else (the online-play server) goes straight to the network
});
