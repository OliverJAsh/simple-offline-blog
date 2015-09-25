import h from 'virtual-dom/h';
import mainView from './main';
import postFragment from '../shared/fragments/post';

export default (post) => (
    mainView({ body: postFragment(post), templateData: post })
);
