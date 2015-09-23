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
* Server serves a shell. That is, a wrapper for the content.
* Shell contains logic for fetching and rendering content

## Fetch and cache rules
* Serve from cache or else network. When serving from cache, fetch the newest
  content from the network to update the content on screen and then revalidate
  the cache.
* Home page content is always cached
* Article page content is optionally cached
