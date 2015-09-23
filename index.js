/* eslint-env node */

import express from 'express';
import compression from 'compression';
import treeToHTML from 'vdom-to-html';

import homeView from './views/home';
import articleView from './views/article';
import mainView from './views/main';

const articles = [
    { id: 'my-first-article', title: 'My First Article', body: '<p>Hello, World!</p>', date: new Date(2015, 0, 1) },
    { id: 'my-second-article', title: 'My Second Article', body: '<p>Goodbye, World!</p>', date: new Date(2015, 0, 2) }
];

const articleIdToArticleMap = articles.reduce((accumulator, content) => {
    accumulator[content.id] = content;
    return accumulator;
}, {});

const app = express();

app.use(compression());

app.use('/', express.static(`${__dirname}/public`));

const sortArticlesByDateDesc = a => a.sort((articleA, articleB) => articleA.date < articleB.date);

app.get('/', (req, res) => homeView(sortArticlesByDateDesc(articles)).then(node => (
    res.send(treeToHTML(node))
)));

app.get('/articles/:articleId', (req, res) => {
    const article = articleIdToArticleMap[req.params.articleId];
    if (article) {
        articleView(article).then(node => (
            res.send(treeToHTML(node))
        ));
    } else {
        res.sendStatus(404);
    }
});

app.get('/shell', (req, res) => mainView().then(node => res.send(treeToHTML(node))));

//
// Serve HTML fragments of content
//
app.get('/content/articles', (req, res) => (
    res.send(sortArticlesByDateDesc(articles))
));

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
