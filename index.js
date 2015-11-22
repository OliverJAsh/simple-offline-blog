import http from 'http';
import express from 'express';
import compression from 'compression';
import treeToHTML from 'vdom-to-html';

import errorView from './shared/views/error';
import homeView from './shared/views/home';
import postView from './shared/views/post';
import mainView from './shared/views/main';

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

// TODO: Long cache expiry for browsers without SW
app.use('/', express.static(`${__dirname}/public`));

const sortPostsByDateDesc = a => a.sort((postA, postB) => postA.date < postB.date);

//
// Content API
//
var apiRouter = express.Router();

apiRouter.get('/posts', (req, res) => (
    res.send(sortPostsByDateDesc(posts))
));

apiRouter.get('/posts/:postId', (req, res, next) => {
    const post = postIdToPostMap[req.params.postId];
    if (post) {
        res.send(post);
    } else {
        next();
    }
});

apiRouter.use((req, res) => (
    res.status(404).send({ message: http.STATUS_CODES[404] })
));

//
// Site
//
var siteRouter = express.Router();

siteRouter.get('/', (req, res, next) => (
    homeView(sortPostsByDateDesc(posts))
        .then(node => res.send(treeToHTML(node)))
        .catch(next)
));

siteRouter.get('/posts/:postId', (req, res, next) => {
    const post = postIdToPostMap[req.params.postId];
    if (post) {
        postView(post)
            .then(node => res.send(treeToHTML(node)))
            .catch(next);
    } else {
        next();
    }
});

siteRouter.get('/shell', (req, res, next) => (
    mainView()
        .then(node => res.send(treeToHTML(node)))
        .catch(next)
));

siteRouter.use((req, res, next) => (
    errorView({ statusCode: 404, message: http.STATUS_CODES[404] })
        .then(node => res.status(404).send(treeToHTML(node)))
        .catch(next)
));

// Order matters
app.use('/api', apiRouter);
app.use('/', siteRouter);

const server = app.listen(process.env.PORT || 8080, () => {
    const { port } = server.address();

    console.log(`Server running on port ${port}`);
});
