import h from 'virtual-dom/h';

export default ({ body }={}) => (
    Promise.resolve(body).then(resolvedBody => (
        <html>
            <head>
                <title>Blog</title>
                <meta name='viewport' content='width=device-width' />

                <script async src='/js/main-bundle.js'></script>
            </head>
            <body>
                <h1><a href='/'>Blog</a></h1>
                <div id="js-content">
                    {resolvedBody}
                </div>
            </body>
        </html>
    ))
);
