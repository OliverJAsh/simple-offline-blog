/* eslint-env node */
import gulp from 'gulp';
import watch from 'gulp-watch';
import jspm from 'jspm';
import path from 'path';

let builderCache = {};

const removeFromTrace = (moduleId) => delete builderCache.trace[moduleId];

const moduleExpression = 'main';
const outputDir = `${__dirname}/public`;
const writeFileName = `${outputDir}/js/main-bundle.js`;

// Run function again for incremental builds
// Equivalent: ./node_modules/.bin/jspm --minify bundle-sfx main public/js/main-bundle.js
const build = (changedModuleId) => {
    const builder = new jspm.Builder();

    if (changedModuleId) {
        removeFromTrace(changedModuleId);
    }

    builder.setCache(builderCache);

    const buildStart = Date.now();
    return builder.buildStatic(moduleExpression, writeFileName, {
        // TODO: Don't minify in dev?
        minify: true,
        sourceMaps: true,
        sourceMapContents: true
    })
        .then(() => {
            builderCache = builder.getCache();

            const buildEnd = Date.now();
            console.log(`bundle time: ${buildEnd - buildStart}`);
        });
};

gulp.task('build', () => build());

gulp.task('watch', ['build'], () => {
    const baseURL = new jspm.Builder().loader.baseURL.replace('file://', '');
    return watch([
        `${baseURL}/**/*.js`,
        // Not all files live in the jspm base
        `${__dirname}/**/*.js`,
        `!${outputDir}/**/*.js`
    ], (vinyl) => {
        // TODO: Map to module ID. How?
        const { path: filePath } = vinyl;
        const moduleId = filePath.startsWith(baseURL)
            ? path.relative(baseURL, filePath)
            : path.relative(__dirname, filePath);
        console.log(`changed: ${moduleId}`);
        build(moduleId);
    });
});
