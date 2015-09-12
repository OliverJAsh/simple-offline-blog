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

const articleTemplate = (article) =>
    `<h2><a href="/articles/${article.id}">${article.title}</a></h2>` +
    `<p>${article.date.toDateString()}</p>` +
    article.body;

const articlesTemplate = (articles) => {
    const articleLiElements = articles
        // Sort by date descending
        .sort((articleA, articleB) => articleA.date < articleB.date)
        .map(articleTemplate)
        .map(x => `<li>${x}</li>`)
        .join('');
    return `<ul>${articleLiElements}</ul>`;
};

//
// Serve HTML fragments of content
//
app.get('/content/articles', (req, res) => res.send(articlesTemplate(ARTICLES)));
app.get('/content/articles/:articleId', (req, res) => {
    const article = articleIdToArticleMap[req.params.articleId];
    if (article) {
        res.send(articleTemplate(article));
    } else {
        res.sendStatus(404);
    }
});

const server = app.listen(8080, () => {
    const { address, port } = server.address();

    console.log(`Server running on port ${port}`);
});
