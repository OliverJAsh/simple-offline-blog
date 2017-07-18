/* eslint-env serviceworker */

const version = 1;
const staticCacheName = 'static-' + version;
const contentCacheName = 'content';

const expectedCaches = [
    staticCacheName,
    contentCacheName
];

self.addEventListener('install', (event) => {
    console.log('Install');
    // Cache the shell
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => (
            cache.addAll([
                '/shell',
                '/js/main-bundle.js'
            ])
        ))
    );
});

self.addEventListener('activate', (event) => {
    console.log('Activate');
    const cacheKeysForDeletionPromise = caches.keys().then((keys) => (
        keys.filter((key) => (
            expectedCaches.every((i) => key !== i)
        ))
    ));

    event.waitUntil(
        cacheKeysForDeletionPromise.then((cacheKeysForDeletion) => {
            console.log('Flushing old caches: ' + cacheKeysForDeletion);
            return Promise.all(cacheKeysForDeletion.map((key) => (
                caches.delete(key)
            )));
        })
    );
});

self.addEventListener('fetch', (event) => {
    const requestURL = new URL(event.request.url);

    // Serve shell if root request and pathname is / or /posts/:postId
    const isRootRequest = requestURL.origin === location.origin;
    const homeOrArticlePageRegExp = new RegExp('^/(posts/.+)?$');
    const shouldServeShell = isRootRequest && homeOrArticlePageRegExp.test(requestURL.pathname);
    if (shouldServeShell) {
        event.respondWith(caches.match('/shell'));
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => (
                response || fetch(event.request)
            ))
        );
    }
});
