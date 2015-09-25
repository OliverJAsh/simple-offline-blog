/* eslint-env browser, serviceworker */

var version = 1;
var staticCacheName = 'static-' + version;
var contentCacheName = 'content';

var expectedCaches = [
    staticCacheName,
    contentCacheName
];

self.addEventListener('install', function (event) {
    console.log('Install');
    // Cache the shell
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                '/shell',
                '/js/main-bundle.js'
            ]);
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('Activate');
    var cacheKeysForDeletionPromise = caches.keys().then(function (keys) {
        return keys.filter(function (key) {
            return expectedCaches.every(function (i) {
                return key !== i;
            });
        });
    });

    event.waitUntil(
        cacheKeysForDeletionPromise.then(function (cacheKeysForDeletion) {
            console.log('Flushing old caches: ' + cacheKeysForDeletion);
            return Promise.all(cacheKeysForDeletion.map(function (key) {
                return caches.delete(key);
            }));
        })
    );
});

self.addEventListener('fetch', function (event) {
    var requestURL = new URL(event.request.url);

    // Serve shell if root request and pathname is / or /posts/:postId
    var isRootRequest = requestURL.origin === location.origin;
    var homeOrArticlePageRegExp = new RegExp('^/(posts/.+)?$');
    var shouldServeShell = isRootRequest && homeOrArticlePageRegExp.test(requestURL.pathname);
    if (shouldServeShell) {
        event.respondWith(caches.match('/shell'));
    } else {
        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response || fetch(event.request);
            })
        );
    }
});
