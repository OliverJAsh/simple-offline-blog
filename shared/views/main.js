import h from '../h';

export default ({ title, body, templateData }={}) => (
    Promise.resolve(body).then(resolvedBody => (
        <html>
            <head>
                <title>{title ? `${title} – ` : ''}Blog</title>
                <meta name='viewport' content='width=device-width' />
                <script defer src='/js/main-bundle.js'></script>
            </head>
            <body>
                <h1><a href='/'>Blog</a></h1>
                {resolvedBody}
                {templateData ? (
                    <script id='template-data' type='application/json'>
                        {JSON.stringify(templateData)}
                    </script>
                ) : ''}
            </body>
        </html>
    ))
);
