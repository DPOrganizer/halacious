'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var bump = require('gulp-bump');
var git = require('gulp-git');
var filter = require('gulp-filter');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var tag = require('gulp-tag-version');
var spawn = require('child_process').spawn;

gulp.task('test', function() {
    return gulp.src(['test/*.js'])
        .pipe(mocha({ exit: true }));
});

function inc(importance) {
    // get all the files to bump version in
    return gulp.src(['./package.json', './bower.json'])
        // bump the version number in those files
        .pipe(bump({type: importance}))

        // save it back to filesystem
        .pipe(gulp.dest('./'))

        // commit the changed version number
        .pipe(git.commit('bumps package version'))

        // read only one file to get the version number
        .pipe(filter('package.json'))

        // **tag it in the repository**
        .pipe(tag())
}

gulp.task('publish', function () {
    return spawn('npm', ['publish'], { stdio: 'inherit' });
});

gulp.task('patch', function () {
    return inc('patch');
});

gulp.task('feature', function () {
    return inc('minor');
});

gulp.task('major', function () {
    return inc('major');
});

gulp.task('lint', function () {
    return gulp.src('./lib/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('push', function () {
    return git.push('origin', 'master', {args: '--tags'}, );
});

gulp.task('release', gulp.series(['lint', 'test', 'patch']));

gulp.task('default', gulp.series(['lint', 'test']));