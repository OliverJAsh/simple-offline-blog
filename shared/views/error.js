import h from 'virtual-dom/h';
import mainView from './main';

export default (data) => (
    mainView({ title: data.message, body: h('p', data.message), templateData: data })
);
