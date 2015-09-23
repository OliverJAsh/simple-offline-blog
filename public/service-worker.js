/* eslint-env browser, serviceworker */

self.addEventListener('install', function (event) {
    // Cache the shell
    event.waitUntil(
        caches.open('static').then(function (cache) {
            return cache.addAll([
                '/shell',
                '/js/main-bundle.js'
            ]);
        })
    );
});

var getStaleWhileRevalidate = function (request, cache) {
    return cache.match(request).then(function (response) {
        var fetchPromise = fetch(request).then(function(networkResponse) {
            if (networkResponse.status !== 200) {
                throw new Error('Bad response');
            }
            cache.put(request, networkResponse.clone());
            return networkResponse;
        });
        return response || fetchPromise;
    });
};

self.addEventListener('fetch', function (event) {
    var requestURL = new URL(event.request.url);

    // Serve shell if root request and pathname is / or /articles/:articleId
    var isRootRequest = requestURL.origin === location.origin;
    var homeOrArticlePageRegExp = new RegExp('^/(articles/.+)?$');
    var shouldServeShell = isRootRequest && homeOrArticlePageRegExp.test(requestURL.pathname);
    if (shouldServeShell) {
        event.respondWith(
            caches.open('static').then(function (cache) {
                return getStaleWhileRevalidate('/shell', cache);
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response || fetch(event.request);
            })
        );
    }
});
