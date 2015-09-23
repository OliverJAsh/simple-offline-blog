# Simple offline blog

A simple offline blog, using ServiceWorker.

![Demo](demo.gif)

## Installation

```
npm install
npm start
jspm install
npm run bundle-js
```

## Architecture
* To begin with, the server renders. A service worker is installed after the
  first render.
* Subsequent requests will be proxied by the service worker, which will serve a
  cached shell for all pages (a wrapper for the content). The shell contains
  logic for fetching and rendering content.

Note that this means browsers without service worker support will just continue
to use server side rendering.

## Fetch and cache rules
* Serve from cache or else network. When serving from cache, fetch the newest
  content from the network to update the content on screen and then revalidate
  the cache.
* Home page content is always cached
* Article page content is optionally cached
