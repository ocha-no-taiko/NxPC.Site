let gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
let sourcemaps = require('gulp-sourcemaps');
let cssmin = require('gulp-cssmin');
const { build: buildHtml } = require('./build.js');

function sassTask()
{
	return gulp.src('./scss/style.scss')
			.pipe(sourcemaps.init())
			.pipe(sass())
			.pipe(sourcemaps.write())
			.pipe(cssmin())
			.pipe(gulp.dest('./src/'));
}

function htmlTask(done)
{
	buildHtml();
	done();
}

function move()
{
    return gulp.src('./src/**/*')
        .pipe(gulp.dest('../NxPC78/src'));
}

function watchTask()
{
	gulp.watch([
		'./scss/**',
		'./src/event.json',
		'./src/*.js',
		'./src/js/*.js'
	], gulp.series(sassTask, htmlTask, move));
}

exports.sass = sassTask;
exports.html = htmlTask;
exports.move = move;
exports.watch = watchTask;
exports.default = gulp.series(sassTask, htmlTask);