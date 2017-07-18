// Used in hyperscript because children cannot be booleans
// https://github.com/Matt-Esch/virtual-dom/issues/326
export default (condition) => condition ? true : undefined;
