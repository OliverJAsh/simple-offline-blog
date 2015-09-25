import h from 'virtual-dom/h';
import mainView from './main';
import postsFragment from '../shared/fragments/posts';

export default (posts) => (
    mainView({ body: postsFragment(posts), templateData: posts })
);
