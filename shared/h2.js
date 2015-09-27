// babel-plugin-jsx-factory is broken WRT whitespace, so we just use the built
// in React transformer for now.
// https://github.com/substack/babel-plugin-jsx-factory/pull/8
import h from 'virtual-dom/h';
const h2 = (name, attrs, ...children) => h(name, attrs, children);

export default h2;
