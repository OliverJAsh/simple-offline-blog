/* eslint-env node */
'use strict';

var jspm = require('jspm');
var builder = new jspm.Builder();
var System = builder.loader;

System.config({ paths: { 'shared/*': './shared/*' }});

builder.buildSFX('main', 'public/js/main-bundle.js', {
    minify: true,
    sourceMaps: true,
    sourceMapContents: true });
