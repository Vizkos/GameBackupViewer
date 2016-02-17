var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var rimraf = require('rimraf');
var execSync = require('child_process').execSync;

var COMPILE_PATH = './dist';
var SRC_PATH = "./src";

gulp.task('lint', function () {
    return gulp.src(['src/**/*.js'])
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failOnError());
});

gulp.task('clean', function (cb) {
    rimraf(COMPILE_PATH, cb);
});

gulp.task('copyAssets', ['clean', 'lint'], function() {
    gulp.src(['./css/*'])
        .pipe(gulp.dest(COMPILE_PATH + '/css'));
        
    gulp.src(['./imgs/*'])
        .pipe(gulp.dest(COMPILE_PATH + '/imgs'));
        
    gulp.src(['./data/*'])
        .pipe(gulp.dest(COMPILE_PATH + '/data'));
});

gulp.task('copy', ['clean', 'lint' ,'copyAssets'], function() {
    gulp.src(['./jspm_packages/**/*'])
        .pipe(gulp.dest(COMPILE_PATH + '/jspm_packages'));

    gulp.src(['index.html', 'config.js'])
        .pipe(gulp.dest(COMPILE_PATH));

    return gulp.src([SRC_PATH + '/**/*.js', SRC_PATH + '/**/*.html', SRC_PATH + '/**/*.css'])
        .pipe(gulp.dest(COMPILE_PATH + "/src"));
});

gulp.task('processHtml', ['clean', 'lint'], function() {
    return gulp.src('index.html')
        .pipe(plugins.processhtml())
        .pipe(gulp.dest(COMPILE_PATH));
});

gulp.task('bundle', ['clean', 'lint', 'copyAssets'], function() {
    console.log(execSync('jspm bundle-sfx --minify src/app dist/app.min.js').toString());
});

gulp.task('default', ['clean', 'lint', 'copyAssets', 'copy']);
gulp.task('release', ['clean', 'lint', 'copyAssets', 'processHtml', 'bundle']);