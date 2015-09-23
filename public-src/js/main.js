/* eslint-env browser */

import h from 'virtual-dom/h';
// Until SystemJS supports babel plugins, we have to stub React, because that's
// what Babel compiles to
// https://github.com/systemjs/systemjs/issues/779
window.React = { createElement: (name, attrs, ...children) => h(name, attrs, children) };
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';
import domToVdom from 'vdom-virtualize';

import articlesFragment from 'shared/fragments/articles';
import articleFragment from 'shared/fragments/article';

import { isContentCached, getContentUrl } from 'shared/helpers';

navigator.serviceWorker.register('/service-worker.js')
    .then(() => {
        console.log('Service worker registered');
    });

const contentNode = document.querySelector('#js-content');

let rootNode;
let currentTree;
const hasServerRender = !! contentNode.firstElementChild;
if (hasServerRender) {
    rootNode = contentNode.firstElementChild;
    currentTree = domToVdom(rootNode);
} else {
    currentTree = <div>Loading…</div>;
    rootNode = createElement(currentTree);
    contentNode.appendChild(rootNode);
}

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
                                return networkResponse.clone().json()
                                    .then(render);
                            } else {
                                return networkResponse.clone().text().then(text => <p>{text}</p>);
                            }
                        }, error => <p>{error.message}</p>)
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

//
// Routing
//

const homeRegExp = /^\/$/;
const articleRegExp = /^\/articles\/(.*)$/;
if (homeRegExp.test(location.pathname)) {
    const contentId = 'articles';

    handlePageState(contentId, {
        shouldCache: true,
        render: articlesFragment
    });
}
else if (articleRegExp.test(location.pathname)) {
    const contentId = 'articles/' + location.pathname.match(articleRegExp)[1];

    isContentCached(contentId).then(isCached =>
        handlePageState(contentId, {
            shouldCache: isCached,
            render: articleFragment
        })
    );
}
