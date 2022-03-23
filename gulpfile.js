// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat');
// var jshint = require('gulp-jshint');
var minifyCss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
// var uglify = require('gulp-uglify');

// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src('public/sass/*.scss')
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(sass())
    .pipe(gulp.dest('public/css'));
});

// Concatenate & Minify CSS
gulp.task('css', function() {
  return gulp.src('pubic/css/*.css')
    .pipe(concat('all.css'))
    .pipe(gulp.dest('public/css'))
    .pipe(minifyCss({compatibility: 'ie9'}))
    .pipe(rename('all.min.css'))
    .pipe(gulp.dest('public/production'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('public/sass/*.scss', gulp.series('sass', 'css'));
});

// Default Task
gulp.task('default', gulp.series('sass', 'css', 'watch'));
