/* eslint-env browser */

import h from 'virtual-dom/h';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import createElement from 'virtual-dom/create-element';
import createVirtualizeFn from 'html-to-vdom';

const virtualize = createVirtualizeFn({ VNode, VText });

navigator.serviceWorker.register('/service-worker.js')
    .then(() => {
        console.log('Service worker registered');
    });

const getContentUrl = (contentId) => '/content/' + contentId;

const isContentCached = (contentId) =>
    caches.open('content').then((cache) =>
        cache.match(getContentUrl(contentId))
            .then(response => !! response)
    );

let currentTree = h('div');
let rootNode = createElement(currentTree);
const contentNode = document.querySelector('#js-content');
contentNode.appendChild(rootNode);

const updateContent = ({ source, tree: newTree }) => {
    console.log(`Render: from ${source}`);
    const patches = diff(currentTree, newTree);
    rootNode = patch(rootNode, patches);
    currentTree = newTree;
};

// Stale-while-revalidate

// Load patterns:
// cache - display - network - display - END
// no cache - network - display - END

// Tests:
// - Server error
// - No cache with network
// - No cache without network
// - Cache
// - Cache then update

// Serve from cache or else network. When serving from cache,
// fetch the newest content from the network to update the
// content on screen and then revalidate the cache.
// This function has side effects.
const handlePageState = (contentId, { shouldCache, render }) => {
    const url = getContentUrl(contentId);
    const networkPromise = fetch(url);
    const cachePromise = caches.match(url);

    if (shouldCache) {
        console.log('Cache: update');
        networkPromise.then(networkResponse =>
            caches.open('content').then(cache => cache.put(url, networkResponse.clone()))
        );
    }

    // Cache or else network
    const initialRender = () => (
        cachePromise
            .then(cacheResponse => {
                if (cacheResponse) {
                    return cacheResponse.clone().json()
                        .then(render)
                        .then(tree => ({ source: 'cache', tree }));
                } else {
                    return networkPromise
                        .then(networkResponse => {
                            if (networkResponse.ok) {
                                return networkResponse.clone().json().then(render);
                            } else {
                                return networkResponse.clone().text().then(text => h('p', text));
                            }
                        }, error => h('p', error.message))
                        .then(tree => ({ source: 'network', tree }));
                }
            })
            .then(updateContent)
    );

    // If previously served from cache, update the content on screen from the
    // network (if response was OK)
    const conditionalNetworkRender = () => (
        cachePromise.then(cacheResponse =>
            networkPromise.then(networkResponse => {
                if (cacheResponse && networkResponse.ok) {
                    return networkResponse.clone().json()
                        .then(render)
                        .then(tree => ({ source: 'network', tree }))
                        .then(updateContent);
                }
            })
        )
    );

    return initialRender().then(conditionalNetworkRender);
};

const renderArticlePage = (article) => {
    const contentId = `articles/${article.id}`;
    return isContentCached(contentId).then(isCached =>
        h('div', [
            h('label', [
                h('input', { type: 'checkbox', checked: isCached, onchange: () =>
                    caches.open('content').then((cache) => {
                        const shouldCache = event.target.checked;
                        if (shouldCache) {
                            return cache.add(getContentUrl(contentId)).catch(() =>
                                event.target.checked = false
                            );
                        } else if (isCached) {
                            cache.delete(getContentUrl(contentId));
                        }
                    })
                }),
                ' Read offline'
            ]),
            h('article', [
                h('h2', h('a', { href: `/articles/${article.id}` }, article.title)),
                h('p', new Date(article.date).toDateString()),
                virtualize(article.body)
            ])
        ])
    );
};

const renderHomePage = (articles) =>
    Promise.all(
        articles.map(
            article => isContentCached(`articles/${article.id}`)
                .then(isCached =>
                    h('li', [
                        h('h2', h('a', { href: `/articles/${article.id}` }, article.title)),
                        isCached ? h('p', h('strong', 'Available offline')) : undefined,
                        h('p', new Date(article.date).toDateString()),
                        virtualize(article.body)
                    ])
                )
        )
    ).then(articleNodes =>
        h('ul', articleNodes)
    );

//
// Routing
//

const homeRegExp = /^\/$/;
const articleRegExp = /^\/articles\/(.*)$/;
if (homeRegExp.test(location.pathname)) {
    const contentId = 'articles';

    handlePageState(contentId, {
        shouldCache: true,
        render: renderHomePage
    });
}
else if (articleRegExp.test(location.pathname)) {
    const contentId = 'articles/' + location.pathname.match(articleRegExp)[1];

    isContentCached(contentId).then(isCached =>
        handlePageState(contentId, {
            shouldCache: isCached,
            render: renderArticlePage
        })
    );
}
