import h from 'virtual-dom/h';

export default ({ body, templateData }={}) => (
    Promise.resolve(body).then(resolvedBody => (
        <html>
            <head>
                <title>Blog</title>
                <meta name='viewport' content='width=device-width' />
                <script defer src='/js/main-bundle.js'></script>
            </head>
            <body>
                <h1><a href='/'>Blog</a></h1>
                <div id="js-content">
                    {resolvedBody}
                </div>
                {templateData ? (
                    <script id='template-data' type='application/json'>
                        {JSON.stringify(templateData)}
                    </script>
                ) : ''}
            </body>
        </html>
    ))
);
