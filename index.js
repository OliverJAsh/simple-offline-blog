/* eslint-env node */

import express from 'express';

const app = express();

app.use('/', express.static(`${__dirname}/public`));

//
// Serve shell for / and /articles/:articleId
//
const homeOrArticlePageRegExp = new RegExp('^/(articles/.+)?$');
app.get(homeOrArticlePageRegExp, (req, res) => res.sendFile(`${__dirname}/views/shell.html`));

const ARTICLES = [
    { id: 'my-first-article', title: 'My First Article', body: '<p>Hello, World!</p>', date: new Date(2015, 0, 1) },
    { id: 'my-second-article', title: 'My Second Article', body: '<p>Goodbye, World!</p>', date: new Date(2015, 0, 2) }
];

const articleIdToArticleMap = ARTICLES.reduce((accumulator, content) => {
    accumulator[content.id] = content;
    return accumulator;
}, {});

//
// Serve HTML fragments of content
//
app.get('/content/articles', (req, res) =>
    // Sort by date descending
    res.send(ARTICLES.sort((articleA, articleB) => articleA.date < articleB.date)));

app.get('/content/articles/:articleId', (req, res) => {
    const article = articleIdToArticleMap[req.params.articleId];
    if (article) {
        res.send(article);
    } else {
        res.sendStatus(404);
    }
});

const server = app.listen(8080, () => {
    const { port } = server.address();

    console.log(`Server running on port ${port}`);
});
