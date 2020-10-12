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

//оптимизация работы с путями
const PATH = {
    scssFile: './assets/scss/style.scss',
    scssFiles: './assets/scss/**/*.s[ca]ss',
    scssFolder: './assets/scss',
    cssFolder: './assets/css',
    htmlFiles: './*.html',
    jsFiles: './assets/js/**/*.js',
}

const plugins = [
    autoprefixer({ 
        overrideBrowserslist: ['last 5 versions', '> 0.1%'], 
        cascade: true, 
    })
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