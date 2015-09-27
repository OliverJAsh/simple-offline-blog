/* eslint-env browser */

import h2 from 'shared/h2';
// Until SystemJS supports babel plugins, we have to stub React, because that's
// what Babel compiles to
// https://github.com/systemjs/systemjs/issues/779
window.React = { createElement: h2 };
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import domToVdom from 'vdom-virtualize';

import errorView from 'shared/views/error';
import homeView from 'shared/views/home';
import postView from 'shared/views/post';

import { isContentCached, getContentUrl } from 'shared/helpers';

navigator.serviceWorker.register('/service-worker.js')
    .then(() => {
        console.log('Service worker registered');
    });

const contentNode = document.querySelector('#js-content');

const hasServerRender = !! contentNode.firstElementChild;

let rootNode = document.querySelector('html');
let currentTree = domToVdom(rootNode);

const updateContent = ({ source, tree: newTree }) => {
    console.log(`Render: from ${source}`);
    console.timeStamp(`Render: from ${source}`);
    const patches = diff(currentTree, newTree);
    rootNode = patch(rootNode, patches);
    currentTree = newTree;
};

// Stale-while-revalidate

// Load patterns:
// SW - cache - client render - network - client render - END
// SW - no cache - no network - END
// SW - no cache - network - client render - END
// no SW - network - server render - network - client render
// no SW - no network - END

// Tests:
// - Server render, client enhance
// - Server error
// - No cache with network
// - No cache without network
// - Cache
// - Cache then update

// Serve from cache or else network. When serving from cache,
// fetch the newest content from the network to update the
// content on screen and then revalidate the cache.
// This function has side effects.
const handlePageState = (contentId, { shouldCache, renderTemplate }) => {
    const url = getContentUrl(contentId);
    const networkPromise = fetch(url);
    const cachePromise = caches.match(url);

    // Cache or else network
    const initialRender = () => (
        cachePromise
            .then(cacheResponse => {
                if (cacheResponse) {
                    return cacheResponse.clone().json()
                        .then(renderTemplate)
                        .then(tree => ({ source: 'cache', tree }));
                } else {
                    return networkPromise
                        .then(networkResponse => {
                            if (networkResponse.ok) {
                                return networkResponse.clone().json()
                                    .then(renderTemplate);
                            } else {
                                return networkResponse.clone().json()
                                    .then(errorView);
                            }
                        }, error => errorView({ message: error.message }))
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
                        .then(renderTemplate)
                        .then(tree => ({ source: 'network', tree }))
                        .then(updateContent);
                }
            })
        )
    );

    const renders = () => {
        if (hasServerRender) {
            // Re-render to enhance
            const templateData = JSON.parse(document.querySelector('#template-data').text);
            // Duck type error page
            const renderFn = templateData.statusCode && templateData.statusCode !== 200
                ? errorView
                : renderTemplate;
            return renderFn(templateData).then(tree => updateContent({ source: 'template-data', tree }));
        } else {
            return initialRender().then(conditionalNetworkRender);
        }
    };

    renders().then(() => {
        if (shouldCache) {
            networkPromise.then(networkResponse => {
                if (networkResponse.ok) {
                    console.log('Cache: update');
                    return caches.open('content').then(cache => cache.put(url, networkResponse.clone()));
                }
            });
        }
    });
};

//
// Routing
//

const homeRegExp = /^\/$/;
const postRegExp = /^\/posts\/(.*)$/;
if (homeRegExp.test(location.pathname)) {
    const contentId = 'posts';

    handlePageState(contentId, {
        shouldCache: true,
        renderTemplate: homeView
    });
}
else if (postRegExp.test(location.pathname)) {
    const contentId = 'posts/' + location.pathname.match(postRegExp)[1];

    isContentCached(contentId).then(isCached =>
        handlePageState(contentId, {
            shouldCache: isCached,
            renderTemplate: postView
        })
    );
}
