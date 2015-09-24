import h from 'virtual-dom/h';
import mainView from './main';
import articlesFragment from '../shared/fragments/articles';

export default (articles) => (
    mainView({ body: articlesFragment(articles), templateData: articles })
);
