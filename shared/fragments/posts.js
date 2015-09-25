/* eslint-env browser */
import h from 'virtual-dom/h';

import { isContentCached } from '../helpers';

export default (posts) => {
    const articleLINodesPromise = Promise.all(posts.map((post) => {
        const contentId = `posts/${post.id}`;
        return isContentCached(contentId).then(isCached => (
            <li>
                <h2><a href={`/${contentId}`}>{post.title}</a></h2>
                {isCached ? <p><strong>Available offline</strong></p> : undefined}
                <p>{new Date(post.date).toDateString()}</p>
                <div innerHTML={post.body} />
            </li>
        ));
    }));
    return articleLINodesPromise.then(articleLINodes => (
        <ul>{articleLINodes}</ul>
    ));
};
