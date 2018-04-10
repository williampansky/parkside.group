// ========================================================================
// gulpfile.js
// ========================================================================

/**
 * Gulp is a tool that helps automate our workflow by performing different 
 * tasks such as: compiling (and prefixing) Sass and minifying images.
 * 
 * To get started, navigate to your project's root directory and
 * run the following CLI command: `npm install`
 * 
 * CLI Command Index
 * =======================
 * npm install          Installs Gulp & dependecies via package.json
 * gulp --help, -h      Displays Gulp options
 * gulp --tasks, -T     Prints the task dependency tree
 * 
 * More info: http://wiki.esitelabs.com:1081/index.php/Gulp_Workflow
 */


 
/**
 * | TABLE OF CONTENTS
 * =======================
 * |– PLUGINS (const * = require('*'))
 * |  |- ...
 * |
 * |– VARIABLES
 * |  |- Localhost
 * |  |- Paths
 * |  |- Entry Points
 * |  |- Additionals
 * |  |- Browser Support
 * |  |- Flags
 * |
 * |– TASKS LIST
 * |  |- Descriptions
 * |  |- ...
 * |  |- TASKS => *
 * |  |  |- defaultTask()
 * |  |  |- sassTask()
 * |  |  |- imageTask()
 * |  |  |- watchTask()
 * |  |  |- deployTask()
 * |  |  |- exportTask()
 * |  |  |- statsTask()
 * |  |  |- sassdocsTask()
 * |  |  |- jsdocsTask()
 * |
 * |– LINKS & RESOURCES
 * |  |- ...
 */



// ========================================================================
// PLUGINS
// ========================================================================
// For documentation on these plugins, see the 'LINKS & RESOURCES' section.
const gulp          = require('gulp'),
    _               = require('lodash'),
    autoprefixer    = require('autoprefixer'),
    babel           = require('gulp-babel'),
    browserSync     = require('browser-sync').create(),
    chug            = require('gulp-chug'),
    color           = require('gulp-color'),
    concat          = require('gulp-concat'),
    cssnano         = require('cssnano'),
    cssstats        = require('postcss-cssstats'),
    es              = require('event-stream'),
    eslint          = require('gulp-eslint'),
    gulpIgnore      = require('gulp-ignore'),
    gulpStylelint   = require('gulp-stylelint'),
    gulpif          = require('gulp-if'),
    imagemin        = require('gulp-imagemin'),
    minify          = require('gulp-babel-minify'),
    minimist        = require('minimist'),
    postcss         = require('gulp-postcss'),
    rename          = require("gulp-rename"),
    sass            = require('gulp-sass'),
    size            = require('gulp-size'),
    sourcemaps      = require('gulp-sourcemaps'),
    uglify          = require('gulp-uglify');



// ========================================================================
// VARIABLES
// ========================================================================
// Localhost URL for BrowserSync
// Use the --proxy flag to change without editing this file
const localhost = 'project.localhost';

// Paths
const paths = {
    // source files
    root:       './',
    source:     'src/',
    sass:       'src/scss/',
    scripts:    'src/js/',
    dist:       'dist/',
    nodes:      'node_modules/'
};

// Browser Support
// https://github.com/ai/browserslist#queries
const support = [
    'last 2 versions',  // last 2 ver of major browsers
    'ie >= 9',          // IE v9+
    'iOS >= 8'          // iOS v8+
];

// Flags
const knownFlags = {
    boolean: ['dev', 'bs'],
    string: ['proxy'],
    default: {
        dev: false,
        bs: false,
        proxy: localhost
    }
};

const flags = minimist(
    process.argv.slice(2),
    knownFlags
);



// ========================================================================
// TASKS LIST
// ========================================================================
gulp.task('default', [ // e.g. CLI command: 'npm run gulp'
    'sass', 
    'scripts', 
    'watch'
], defaultTask);
gulp.task('scripts',    scriptsTask);
gulp.task('sass',       sassTask);
gulp.task('watch',      watchTask);



// ========================================================================
// TASKS => DESCRIPTIONS
// ========================================================================
// tasks
defaultTask.description     = 'Runs all tasks.';
sassTask.description        = `Run Stylelint and PostCSS, compile ${paths.sass} files, then save to ${paths.dist}`;
scriptsTask.description     = '@TODO: Add JS concat and minification via Webpack to repo';
watchTask.description       = 'Watches files for changes, compiles on file saves, and reloads BrowserSync if necessary.';

sassTask.flags = {
    default: ' 🏁  Output style is compressed and minified.',
    '--dev': ' 🏁  Output style is expanded and uses sourcemaps.',
};



// TASKS => DEFAULT
// ========================================================================
function defaultTask() {
    console.log(color('                                      ', 'WHITE'));
    console.log(color('**************************************', 'WHITE'));
    console.log(color('                                      ', 'WHITE'));
    console.log(color('      defaultTask() COMPLETE          ', 'GREEN'));
    console.log(color('      ======================          ', 'WHITE'));
    console.log(color('      Be sure to check for errors.    ', 'RED'));
    console.log(color('                                      ', 'WHITE'));
    console.log(color('**************************************', 'WHITE'));
    console.log(color('                                      ', 'WHITE'));

    if (flags.bs) {
        return browserSync.init({
            proxy: flags.proxy,
            online: true,
        });
    }
}



// ========================================================================
// TASKS => SASS
// ========================================================================
function sassTask() {
    // postCSS plugin calls
    let plugins = [
        autoprefixer({ browsers: support }),
        cssnano({
            preset: ['default', {
                discardComments: { removeAll: true },
            }]
        }),
    ];

    // display cli log msg
    console.log(color('                                      ', 'WHITE'));
    console.log(color('✅  ', 'WHITE') + color('sassTask()   ', 'GREEN'));
    console.log(color('                                      ', 'WHITE'));

    // sass pipeline
    return gulp.src(paths.sass + '/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(gulpStylelint({
            reporters: [{
                formatter: 'string',
                console: true,
            }]
        }))
        .pipe(sass({ outputStyle: 'compressed' })
        .on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write('./'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dist))
        .pipe(size({
            title: 'CSS:',
            pretty: true,
            showFiles: true,
            showTotal: true
        }))
        .pipe(gulpif(flags.bs, browserSync.stream()));
}



// ========================================================================
// TASK => WATCH
// ========================================================================
function watchTask() {
    // display cli log msg
    console.log(color('✅  ', 'WHITE') + color('watchTask()', 'GREEN'));

    // watch sass
    gulp.watch(paths.sass + '/**/*.scss', ['sass'])
        .on('change', (event) => {
            console.log(color('                                      ', 'WHITE'));
            console.log(color('**************************************', 'WHITE'));
            console.log(color('SCSS FILECHANGE DETECTED              ', 'WHITE'));
            console.log(color('=========================             ', 'WHITE'));
            console.log(color('FILE:', 'WHITE'), color(`${event.path}`, 'YELLOW'));
            console.log(color('EVENT:', 'WHITE'), color(`${event.type}`, 'YELLOW'));
            console.log(color('RETURN:', 'WHITE'), color('Running sassTask() ...   ', 'GREEN'));
            console.log(color('**************************************', 'WHITE'));
            console.log(color('                                      ', 'WHITE'));
        });
}



// ========================================================================
// TASK => SCRIPTS
// ========================================================================
function scriptsTask() {
    // display cli log msg
    // console.log(color('✅  ', 'WHITE') + color('scriptsTask()', 'GREEN'));
    // console.log(color('❌  ', 'RED') + color('@TODO: Add JS concat and minification via Webpack to repo', 'RED'));
}



// ========================================================================
// LINKS & RESOURCES
// ========================================================================
/**
 * Autoprefixer             https://github.com/postcss/autoprefixer
 * BrowserSync              https://browsersync.io/docs/gulp
 * CSS Nano                 http://cssnano.co/
 * CSS Stats                https://github.com/cssstats/postcss-cssstats
 * Event Stream             https://github.com/dominictarr/event-stream
 * Gulp                     https://gulpjs.com/
 * Gulp Babel               https://github.com/babel/gulp-babel
 * Gulp Babel Minify        https://github.com/babel/minify/tree/master/packages/gulp-babel-minify
 * Gulp Chug                https://github.com/robatron/gulp-chug
 * Gulp CLI                 https://github.com/gulpjs/gulp-cli
 * Gulp Color               https://github.com/jikkai/gulp-color
 * Gulp Concat              https://github.com/contra/gulp-concat
 * Gulp ESLint              https://github.com/adametry/gulp-eslint
 * Gulp If                  https://github.com/robrich/gulp-if
 * Gulp Ignore              https://github.com/robrich/gulp-ignore
 * Gulp Imagemin            https://github.com/sindresorhus/gulp-imagemin
 * Gulp JSDoc               https://www.npmjs.com/package/gulp-jsdoc3
 * Gulp Rename              https://github.com/hparra/gulp-rename
 * Gulp Sass                https://www.npmjs.com/package/gulp-sass
 * Gulp Size                https://github.com/sindresorhus/gulp-size
 * Gulp Sourcemaps          https://github.com/gulp-sourcemaps/gulp-sourcemaps
 * Gulp Stylelint           https://github.com/olegskl/gulp-stylelint
 * Gulp Stylelint           https://www.npmjs.com/package/gulp-stylelint
 * Gulp Uglify              https://github.com/terinjokes/gulp-uglify
 * Gulp Util                https://github.com/gulpjs/gulp-util
 * Gulp Zip                 https://github.com/sindresorhus/gulp-zip
 * Lodash                   https://lodash.com/
 * JSDoc                    http://usejsdoc.org/
 * Minimist                 https://github.com/substack/minimist
 * PostCSS                  http://postcss.org/
 * SassDoc                  http://sassdoc.com/
 * Stylelint                https://stylelint.io/
 * Stylelint Standard       https://github.com/stylelint/stylelint-config-standard
 * Webpack                  http://webpack.github.io/docs/usage-with-gulp.html
 */