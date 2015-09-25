import h from 'virtual-dom/h';
import mainView from './main';
import errorFragment from '../shared/fragments/error';

export default (data) => (
    mainView({ body: errorFragment(data), templateData: data })
);
