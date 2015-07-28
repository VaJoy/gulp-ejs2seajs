/**
 * Created by vajoylan on 2015/7/27.
 */
var gulp = require('gulp');
var ejs2seajs = require('gulp-ejs2seajs');

gulp.task('ejs2seajs', function () {
    gulp.src('./src/js/**/tpls')
        .pipe(ejs2seajs())
        .pipe(gulp.dest('./src/'));
});

gulp.task('default',function(){
    gulp.run('ejs2seajs');
});