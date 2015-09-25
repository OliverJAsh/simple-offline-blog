/* eslint-env browser */
import h from 'virtual-dom/h';

import { isClient, getContentUrl, isContentCached } from '../helpers';

export default (post) => {
    const contentId = `posts/${post.id}`;

    return isContentCached(contentId).then(isCached => {
        const cacheOption = isClient ? (
            <label>
                <input type='checkbox' checked={isCached} onchange={(event) => (
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
                )} /> Read offline
            </label>
        ) : undefined;

        return (
            <article>
                <header>
                    {cacheOption}
                    <h2><a href={`/${contentId}`}>{post.title}</a></h2>
                    <p>{new Date(post.date).toDateString()}</p>
                </header>
                <div innerHTML={post.body} />
            </article>
        );
    });
};
