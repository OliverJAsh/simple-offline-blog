import h2 from '../h2';
import mainView from './main';

export default (data) => (
    mainView({ title: data.message, body: <p>{data.message}</p>, templateData: data })
);
