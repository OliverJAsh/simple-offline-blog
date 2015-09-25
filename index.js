/* eslint-env node */

import express from 'express';
import compression from 'compression';
import treeToHTML from 'vdom-to-html';

import homeView from './views/home';
import postView from './views/post';
import mainView from './views/main';

const posts = [
    { id: 'my-first-article', title: 'My First Article', body: '<p>Hello, World!</p>', date: new Date(2015, 0, 1) },
    { id: 'my-second-article', title: 'My Second Article', body: '<p>Goodbye, World!</p>', date: new Date(2015, 0, 2) }
];

const postIdToPostMap = posts.reduce((accumulator, post) => {
    accumulator[post.id] = post;
    return accumulator;
}, {});

const app = express();

app.use(compression());

app.use('/', express.static(`${__dirname}/public`));

const sortPostsByDateDesc = a => a.sort((postA, postB) => postA.date < postB.date);

app.get('/', (req, res, next) => (
    homeView(sortPostsByDateDesc(posts))
        .then(node => res.send(treeToHTML(node)))
        .catch(next)
));

app.get('/posts/:postId', (req, res, next) => {
    const post = postIdToPostMap[req.params.postId];
    if (post) {
        postView(post)
            .then(node => res.send(treeToHTML(node)))
            .catch(next);
    } else {
        next();
    }
});

app.get('/shell', (req, res, next) => (
    mainView()
        .then(node => res.send(treeToHTML(node)))
        .catch(next)
));

//
// Serve content as JSON
//
app.get('/content/posts', (req, res) => (
    res.send(sortPostsByDateDesc(posts))
));

app.get('/content/posts/:postId', (req, res, next) => {
    const post = postIdToPostMap[req.params.postId];
    if (post) {
        res.send(post);
    } else {
        next();
    }
});

app.use((req, res) => (
    res.sendStatus(404)
));

const server = app.listen(8080, () => {
    const { port } = server.address();

    console.log(`Server running on port ${port}`);
});
