import gulp from 'gulp';
import watch from 'gulp-watch';
import jspm from 'jspm';
import path from 'path';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';

let builderCache = {};

const removeFromTrace = (moduleId) => delete builderCache.trace[moduleId];

const moduleExpression = 'main';
const outputDir = `${__dirname}/public`;
const writeFileName = `${outputDir}/js/main-bundle.js`;

// Run function again for incremental builds
// Equivalent: ./node_modules/.bin/jspm --minify bundle-sfx main public/js/main-bundle.js
const buildApp = (changedModuleId) => {
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

gulp.task('build-service-worker', () => (
    gulp.src('./public-src/service-worker.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(uglify({ mangle: { toplevel: true }}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public'))
));
gulp.task('build-app', () => buildApp());

gulp.task('build', ['build-app', 'build-service-worker']);

gulp.task('watch-app', ['build-app'], () => {
    const baseURL = new jspm.Builder().loader.baseURL.replace('file://', '');
    return watch([
        `${baseURL}/**/*.js`,
        `!${baseURL}/jspm_packages`,
        // Not all files live in the jspm base
        `${__dirname}/shared/**/*.js`
    ], (vinyl) => {
        // TODO: Map to module ID. How?
        const { path: filePath } = vinyl;
        const moduleId = filePath.startsWith(baseURL)
            ? path.relative(baseURL, filePath)
            : path.relative(__dirname, filePath);
        console.log(`changed: ${moduleId}`);
        buildApp(moduleId);
    });
});

gulp.task('watch-service-worker', ['build-service-worker'], () => (
    watch(['./public-src/service-worker.js'], () => {
        gulp.start('build-service-worker');
    })
));

gulp.task('watch', ['watch-app', 'watch-service-worker']);
