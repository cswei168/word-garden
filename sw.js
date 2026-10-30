const CACHE='wordgarden-pwa-v2';
const FILES=['./','index.html','style.css','app.js','install.js','install.html','manifest.webmanifest','words.json','LICENSE-ECDICT','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('wordgarden-pwa-')&&k!==CACHE)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==location.origin||!url.pathname.startsWith(self.registration.scope.replace(location.origin,'')))return;e.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(e.request,{ignoreSearch:true});if(hit)return hit;try{return await fetch(e.request)}catch(err){if(e.request.mode==='navigate')return await cache.match('index.html');throw err}})())});
