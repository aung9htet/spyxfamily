let dataCacheName = 'chat-cache-v1';
let cacheName = 'chatPWA';
let filesToCache = [
    '/',
    '/javascripts/idb/index.js',
    '/stylesheets/style.css',
    '/stylesheets/bootstrap.css',
    '/stylesheets/bootstrap-grid.css',
    '/stylesheets/bootstrap-reboot.css',
    '/stylesheets/reset.css',
    '/javascripts/annotation.js',
    '/javascripts/bootstrap.bundle.js',
    '/javascripts/bootstrap.js',
    '/javascripts/canvas.js',
    '/javascripts/chat.js',
    '/javascripts/database.js',
    '/javascripts/database_stories.js',
    '/javascripts/idb/index.js',
    '/javascripts/index.js',
    '/javascripts/loadImage.js'
];

/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(filesToCache);
        })
    );
});


/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial New York City data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. You expect to see the newer NYC
     * data, but you actually see the initial data. This happens because the
     * service worker is not yet activated. The code below essentially lets
     * you activate the service worker faster.
     */
    return self.clients.claim();
});

function promiseAny(promises){
    return new Promise((resolve, reject) => {
        promises = promises.map(p => Promise.resolve(p));
        promises.forEach(p => p.then(resolve));
        promises.reduce((a,b) => a.catch(() => b))
            .catch(() => reject(Error("All failed")));
    });
};

self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] Fetch', e.request.url);
    let dataUrl = e.request.clone()
    if (e.request.url.indexOf(dataUrl) > -1) {
        return fetch(e.request)
            .then( (response) => {
                return response;
            })
            // the error will be passed to Ajax
            .catch((error) => {
                return error;
            })
    } else {
        e.respondWith(
            promiseAny([
                caches.match(e.request),
                fetch(e.request)
            ])
        );
    }
});
