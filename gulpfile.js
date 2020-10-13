//подключаем через современный стандарт
//const gulp = require('gulp');

//можем разворачивать с помощью деструктуризации обьекта, получаем константу, которая будет являться методом объекта gulp
const { task, src, dest, watch, series, parallel, tree } = require('gulp');
const sass = require('gulp-sass');
const bs = require('browser-sync'); //plagin for online-reload
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const csscomb = require('gulp-csscomb');
const notify = require('gulp-notify');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const uglify = require('gulp-uglify');
const terser = require('gulp-terser');
const concat = require('gulp-concat');

//оптимизация работы с путями
const PATH = {
    scssFile: './assets/scss/style.scss',
    scssFiles: './assets/scss/**/*.s[ca]ss',
    scssFolder: './assets/scss',
    cssFolder: './assets/css',
    cssDestFolder: './dest/css',
    htmlFiles: './*.html',
    jsFiles: [
        './assets/js/**/*.js', 
        '!./assets/js/**/*.min.js',
        '!./assets/js/**/all.*',
    ], //в массиве можем настроить значения, которые нам не нужны
    jsFolder: './assets/js',
    jsDestFolder: './dest/js',
    jsBundleName: 'all.js',
}

const plugins = [
    autoprefixer({ 
        overrideBrowserslist: ['last 5 versions', '> 0.1%'], 
        cascade: true, 
    }),
    mqpacker({ sort: sortCSSmq }) //переключение режима сортировки
];

function scss() {
    //через pipe должен пройти исходный файл, который мы загрузили в источники
    //dest - куда выгружаем
    //мы вызываем гальп бибилиотеку, на ней вызываю метод src(т.е. говорю, что источником лдя моей библиотеки будет являться__путь), после этого по цепочке(работа вып. с этим файлом) в pipe  говорю, что нужно с ним ещё что-то сделать, точнее - выгрузку в указанную папку
    return src(PATH.scssFile)
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(dest(PATH.cssFolder))
    .pipe(notify({ message: '-----------------SCSS Compiled!', sound: false }))
    .pipe(bs.stream());
}

function scssMin() {
    const pluginsExtended = plugins.concat([cssnano({ preset: 'default' })]) 

    return src(PATH.scssFile)
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(postcss(pluginsExtended))//минифицируем
    .pipe(rename({ suffix: '.min' })) //говорим, что нужно создать подфайл
    .pipe(dest(PATH.cssFolder));
}

function scssDev() {
    return src(PATH.scssFile, { sourcemaps: true })
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(dest(PATH.cssFolder, { sourcemaps: true }))
    .pipe(notify({ message: '-----------------SCSS Compiled!', sound: false }))
    .pipe(bs.stream());
}

function comb() {
    return src(PATH.scssFiles)
    .pipe(csscomb('./.csscomb.json'))
        .on('error', notify.onError(function (error) {
            return 'File: ' + error.message;
        }))
    .pipe(dest(PATH.scssFolder));
}

function concatJS() {
    return src(PATH.jsFiles)
    .pipe(concat(PATH.jsBundleName))
    .pipe(dest(PATH.jsFolder));
} //создаем отдельный файл в который выгружаем указанные нами файлы с учетом исключений

function uglifyJS() {
    return src(PATH.jsFiles)
    .pipe(uglify({toplevel: true, output: {
        quote_style: 3
    }}))
    .pipe(rename({suffix: '.min'}))
    .pipe(dest(PATH.jsFolder));
} //минификация

function uglifyES6() {
    return src(PATH.jsFiles)
    .pipe(terser({
        toplevel: true, 
        output: {
        quote_style: 3
        }
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(dest(PATH.jsFolder));
}

function bundleJS() {
    return src(PATH.jsDestFolder + '/all.js')
    .pipe(dest(PATH.jsDestFolder));
}

function bundleCSS() {
    return src(PATH.cssFolder + '/*.min.css')
    .pipe(dest(PATH.cssDestFolder));
}

function syncInit() {
    bs.init({
        server: {
            baseDir: './' //говорим, что базовый каталог в корне нашего проекта, поднимаем сервер по текущему каталогу
        }
    });
}

async function sync() {
    bs.reload();
}

//что бы gulp сам следил за файлами нам необходим watcher
function watchFiles() {
    syncInit();
    watch(PATH.scssFiles, series(scss, scssMin));
    watch(PATH.htmlFiles, sync);
    watch(PATH.jsFiles, sync);
}

//1-й параметр -имя функции, так как она будет называться и в консоли
//gulp.task('my', myFunc);

//при деструктуризации можем использовать без gulp
task('watch', watchFiles);
task('scss', series(scss, scssMin));
task('min', scssMin);
task('comb', comb);
task('dev', scssDev);
task('concatjs', concatJS);
task('uglifyjs', uglifyJS);
task('uglifyjses6', uglifyES6);
task('bundle', parallel(bundleCSS, bundleJS));