import h from 'virtual-dom/h';
import exp from '../exp';

export default ({ title, body, templateData }={}) => (
    Promise.resolve(body).then(resolvedBody => (
        h('html', [
            h('head', [
                h('title', [
                    title ? title + ' – ' : '',
                    'Blog'
                ]),
                h('meta', { name: 'viewport', content: 'width=device-width' }),
                h('script', { defer: true, src: '/js/main-bundle.js' })
            ]),
            h('body', [
                h('h1',
                    h('a', { href: '/' }, 'Blog')
                ),
                resolvedBody,
                exp(templateData) && h(
                    'script',
                    { id: 'template-data', type: 'application/json' },
                    JSON.stringify(templateData)
                )
            ])
        ])
    ))
);
