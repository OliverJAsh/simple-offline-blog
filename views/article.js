import h from 'virtual-dom/h';
import mainView from './main';
import articleFragment from '../shared/fragments/article';

export default (article) => (
    mainView({ body: articleFragment(article), templateData: article })
);
