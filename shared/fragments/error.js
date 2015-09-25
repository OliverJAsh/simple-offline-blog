import h from 'virtual-dom/h';

export default (data) => (
    Promise.resolve(<p>{data.message}</p>)
);
