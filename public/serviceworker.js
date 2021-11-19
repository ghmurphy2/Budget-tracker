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