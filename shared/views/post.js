import h from 'virtual-dom/h';
import mainView from './main';
import exp from '../exp';
import { isClient, getContentUrl, isContentCached } from '../helpers';

const postFragment = (post) => {
    const contentId = `posts/${post.id}`;

    return isContentCached(contentId).then(isCached => {
        const cacheOption = exp(isClient) && (
            h('label', [
                h('input', { type: 'checkbox', checked: isCached, onchange: (event) => (
                    caches.open('content').then((cache) => {
                        const shouldCache = event.target.checked;
                        if (shouldCache) {
                            return cache.add(getContentUrl(contentId)).catch(() =>
                                event.target.checked = false
                            );
                        } else {
                            cache.delete(getContentUrl(contentId));
                        }
                    })
                ) }),
                'Read offline'
            ])
        );

        return h('article', [
            h('header', [
                cacheOption,
                h('h2',
                    h('a', { href: '/' + contentId }, post.title)
                ),
                h('p', new Date(post.date).toDateString())
            ]),
            h('div', { innerHTML: post.body })
        ]);
    });
};


export default (post) => (
    mainView({ title: post.title, body: postFragment(post), templateData: post })
);
