const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
// add files to cache from public
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    "index.js",
    '/db.js',
    "service-worker.js",
    "manifest.webmanifest",
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/styles.css'
];

self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Files cached");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Cache Cleared", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', function(e){
    if (e.request.url.includes('/api/')){
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache =>{
                return fetch(e.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(e.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err =>{
                    return cache.match(e.request);
                });
            }).catch(err => console.log('status error'))
        )
        return
    }
    e.respondWith(
        caches.match(e.request).then(function(response){
            return response || fetch(e.request);
        })
    )
})