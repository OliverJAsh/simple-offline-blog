/* eslint-env browser */
import h from 'virtual-dom/h';

import { isContentCached } from '../helpers';

export default (articles) => {
    const articleLINodesPromise = Promise.all(articles.map((article) => {
        const contentId = `articles/${article.id}`;
        return isContentCached(contentId).then(isCached => (
            <li>
                <h2><a href={`/${contentId}`}>{article.title}</a></h2>
                {isCached ? <p><strong>Available offline</strong></p> : undefined}
                <p>{new Date(article.date).toDateString()}</p>
                <div innerHTML={article.body} />
            </li>
        ));
    }));
    return articleLINodesPromise.then(articleLINodes => (
        <ul>{articleLINodes}</ul>
    ));
};
