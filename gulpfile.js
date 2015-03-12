'use strict';

var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var del = require('del');
var gulp = require('gulp');
var inject = require('gulp-inject');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var mainBowerFiles = require('main-bower-files');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var ngAnnotate = require('gulp-ng-annotate');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');

gulp.task('clean', function (done) {
  del('dist', done);
});

gulp.task('clean:fonts', function (done) {
  del('dist/fonts', done);
});

gulp.task('clean:images', function (done) {
  del('dist/images', done);
});

gulp.task('clean:scripts', function (done) {
  del('dist/scripts/scripts*', done);
});

gulp.task('clean:styles', function (done) {
  del('dist/styles/styles*', done);
});

gulp.task('clean:views', function (done) {
  del('dist/views', done);
});

gulp.task('lint', function () {
  return gulp.src('app/scripts/**/*')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
});

gulp.task('appInject', function () {
  return gulp.src('app/index.html')
    .pipe(inject(gulp.src(mainBowerFiles(),
      {read: false}), {name: 'bower', relative: true}))
    .pipe(inject(gulp.src('app/scripts/**/*',
      {read: false}), {relative: true}))
    .pipe(gulp.dest('app'));
});

gulp.task('bowerScripts', function () {
  return gulp.src(mainBowerFiles('**/*.js'))
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(rev.manifest('dist/rev-manifest.json', {merge: true}))
    .pipe(gulp.dest(''));
});

gulp.task('bowerStyles', function () {
  return gulp.src(mainBowerFiles('**/*.css'))
    .pipe(concat('vendor.css'))
    .pipe(minifyCss())
    .pipe(rev())
    .pipe(gulp.dest('dist/styles'))
    .pipe(rev.manifest('dist/rev-manifest.json', {merge: true}))
    .pipe(gulp.dest(''));
});

gulp.task('fonts', function () {
  return gulp.src('app/fonts/**/*')
    .pipe(rev())
    .pipe(gulp.dest('dist/fonts'))
    .pipe(rev.manifest('dist/rev-manifest.json', {merge: true}))
    .pipe(gulp.dest(''));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe(imagemin())
    .pipe(rev())
    .pipe(gulp.dest('dist/images'))
    .pipe(rev.manifest('dist/rev-manifest.json', {merge: true}))
    .pipe(gulp.dest(''));
});

gulp.task('scripts', function () {
  return gulp.src('app/scripts/**/*')
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.js'))
    .pipe(babel())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rev())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(rev.manifest('dist/rev-manifest.json', {merge: true}))
    .pipe(gulp.dest(''));
});

gulp.task('styles', function () {
  return gulp.src('app/styles/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(minifyCss())
    .pipe(rev())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(rev.manifest('dist/rev-manifest.json', {merge: true}))
    .pipe(gulp.dest(''));
});

gulp.task('views', function () {
  return gulp.src('app/views/**/*')
    .pipe(minifyHtml())
    .pipe(rev())
    .pipe(gulp.dest('dist/views'))
    .pipe(rev.manifest('dist/rev-manifest.json', {merge: true}))
    .pipe(gulp.dest(''));
});

gulp.task('index', function () {
  return gulp.src('app/index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('distInject', function () {
  return gulp.src('dist/index.html')
    .pipe(inject(gulp.src(['dist/scripts/vendor*', 'dist/styles/vendor*'],
      {read: false}), {name: 'bower', relative: true}))
    .pipe(inject(gulp.src(['dist/scripts/scripts*', 'dist/styles/styles*'],
      {read: false}), {relative: true}))
    .pipe(minifyHtml())
    .pipe(gulp.dest('dist'));
});

gulp.task('replace', function () {
  return gulp.src('dist/**/*')
    .pipe(revReplace({manifest: gulp.src('dist/rev-manifest.json')}))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
  gulp.watch('app/index.html', gulp.series(
    'index', 'distInject', 'replace', 'reload'));
  gulp.watch('app/fonts/**/*', gulp.series(
    'clean:fonts', 'fonts', 'replace', 'reload'));
  gulp.watch('app/images/**/*', gulp.series(
    'clean:images', 'images', 'replace', 'reload'));
  gulp.watch('app/scripts/**/*', gulp.series(
    'clean:scripts', 'lint', 'appInject', 'scripts', 'index', 'distInject',
    'replace', 'reload'));
  gulp.watch('app/styles/**/*', gulp.series(
    'clean:styles', 'styles', 'index', 'distInject', 'replace', 'reload'));
  gulp.watch('app/views/**/*', gulp.series(
    'clean:views', 'views', 'replace', 'reload'));

  connect.server({root: 'dist', livereload: true});
});

gulp.task('reload', function () {
  return gulp.src('dist')
    .pipe(connect.reload());
});

gulp.task('default', gulp.series(
  'clean', 'lint', 'appInject', 'bowerScripts', 'bowerStyles', 'fonts',
  'images', 'scripts', 'styles', 'views', 'index', 'distInject', 'replace',
  'watch'));
