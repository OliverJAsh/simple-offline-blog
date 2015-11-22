import h from '../h';
import mainView from './main';

export default (data) => (
    mainView({ title: data.message, body: <p>{data.message}</p>, templateData: data })
);
