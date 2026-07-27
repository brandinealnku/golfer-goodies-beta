const CACHE='golfer-goodies-v2';
const SHELL=['./','./index.html','./assets/css/styles.css','./assets/js/app.js','./assets/js/data-service.js','./assets/js/baseline.js','./manifest.webmanifest','./assets/icons/icon.svg','./data/courses.json','./data/products.json','./data/orders.json','./data/users.json','./data/promotions.json','./data/course-applications.json','./data/reviews.json','./data/rewards.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))))});
