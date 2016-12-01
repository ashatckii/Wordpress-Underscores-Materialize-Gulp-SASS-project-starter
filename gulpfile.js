// plugins for development
var gulp = require('gulp'),
rimraf = require('rimraf'),
jade = require('gulp-jade'),
sass = require('gulp-sass'),
inlineimage = require('gulp-inline-image'),
prefix = require('gulp-autoprefixer'),
plumber = require('gulp-plumber'),
dirSync = require('gulp-directory-sync'),
browserSync = require('browser-sync').create(),
concat = require('gulp-concat');

// plugins for build
var purify = require('gulp-purifycss'),
uglify = require('gulp-uglify'),
imagemin = require('gulp-imagemin'),
pngquant = require('imagemin-pngquant'),
csso = require('gulp-csso');

//plugins for testing
var html5Lint = require('gulp-html5-lint');

var assetsDir = 'assets/';
var distDir = 'dist/';
var buildDir = 'build/';

//----------------------------------------------------Compiling
gulp.task('html', function () {
	return gulp.src(assetsDir + '**/*.html')
	.pipe(gulp.dest(distDir))
});

gulp.task('sass', function () {
	gulp.src([assetsDir + 'sass/**/*.scss', '!' + assetsDir + 'sass/**/_*.scss'])
	.pipe(plumber())
	.pipe(sass())
	.pipe(inlineimage())
	.pipe(prefix('last 3 versions'))
	.pipe(gulp.dest(distDir + 'css/'))
	.pipe(browserSync.stream());
});

gulp.task('jsConcat', function () {
	return gulp.src(assetsDir + 'js/**/*.js')
	.pipe(concat('all.js', {newLine: ';'}))
	.pipe(gulp.dest(distDir + 'js/'))
	.pipe(browserSync.stream());
});

//----------------------------------------------------Compiling###

//-------------------------------------------------Synchronization
gulp.task('imageSync', function () {
	return gulp.src('')
	.pipe(plumber())
	.pipe(dirSync(assetsDir + 'img/', distDir + 'img/', {printSummary: true}))
	.pipe(browserSync.stream());
});

gulp.task('fontsSync', function () {
	return gulp.src('')
	.pipe(plumber())
	.pipe(dirSync(assetsDir + 'fonts/', distDir + 'fonts/', {printSummary: true}))
	.pipe(browserSync.stream());
});

gulp.task('jsSync', function () {
	return gulp.src(assetsDir + 'js/*.js')
	.pipe(plumber())
	.pipe(gulp.dest(distDir + 'js/'))
	.pipe(browserSync.stream());
});

//-------------------------------------------------Synchronization###


//watching files and run tasks
gulp.task('watch', function () {
	gulp.watch(assetsDir + '**/*.html', ['html']);
	gulp.watch(assetsDir + 'sass/**/*.scss', ['sass']);
	gulp.watch(assetsDir + 'js/**/*.js', ['jsSync']);
	gulp.watch(assetsDir + 'js/all/**/*.js', ['jsConcat']);
	gulp.watch(assetsDir + 'img/**/*', ['imageSync']);
	gulp.watch(assetsDir + 'fonts/**/*', ['fontsSync']);
});

//livereload and open project in browser
gulp.task('browser-sync', function () {
	browserSync.init({
		proxy: "chickenrecipe.com",
		notify: false
	});
});


//---------------------------------building final project folder
//clean build folder
gulp.task('cleanBuildDir', function (cb) {
	rimraf(buildDir, cb);
});


//minify images
gulp.task('imgBuild', function () {
	return gulp.src(distDir + 'img/**/*')
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	}))
	.pipe(gulp.dest(buildDir + 'img/'))
});

//copy fonts
gulp.task('fontsBuild', function () {
	return gulp.src(distDir + 'fonts/**/*')
	.pipe(gulp.dest(buildDir + 'fonts/'))
});

//copy html
gulp.task('htmlBuild', function () {
	return gulp.src(distDir + '**/*.html')
	.pipe(gulp.dest(buildDir))
});

//copy and minify js
gulp.task('jsBuild', function () {
	return gulp.src(distDir + 'js/**/*')
	.pipe(uglify())
	.pipe(gulp.dest(buildDir + 'js/'))
});

//copy, minify css
gulp.task('cssBuild', function () {
	return gulp.src(distDir + 'css/**/*')
	.pipe(purify([distDir + 'js/**/*', distDir + '**/*.html']))
	.pipe(csso())
	.pipe(gulp.dest(buildDir + 'css/'))
});

//testing your build files
gulp.task('validation', function () {
	return gulp.src(buildDir + '**/*.html')
	.pipe(html5Lint());
});

gulp.task('default', ['html', 'sass', 'imageSync', 'fontsSync', 'jsConcat', 'jsSync', 'watch', 'browser-sync']);

gulp.task('build', ['cleanBuildDir'], function () {
	gulp.start('imgBuild', 'fontsBuild', 'htmlBuild', 'jsBuild', 'cssBuild');
});