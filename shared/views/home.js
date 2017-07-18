import h from 'virtual-dom/h';
import mainView from './main';
import exp from '../exp';
import { isContentCached } from '../helpers';


const postsFragment = (posts) => {
    const articleLINodesPromise = Promise.all(posts.map((post) => {
        const contentId = `posts/${post.id}`;
        return isContentCached(contentId).then(isCached => (
            h('li', [
                h('h2', h('a', { href: `/${contentId}` }, post.title)),
                exp(isCached) && h('p', h('strong', 'Available offline')),
                h('p', new Date(post.date).toDateString()),
                h('div', { innerHTML: post.body })
            ])
        ));
    }));
    return articleLINodesPromise.then(articleLINodes => (
        h('ul', articleLINodes)
    ));
};

export default (posts) => (
    mainView({ body: postsFragment(posts), templateData: posts })
);
