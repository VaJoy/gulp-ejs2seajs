# [gulp](https://github.com/wearefractal/gulp)-ejs2seajs
> translate ejs templets into js files in CMD mode

## Install

Install with [npm](https://npmjs.org/package/gulp-ejs2seajs).

```
npm install --save-dev gulp-ejs2seajs
```

## Examples

```js
var gulp = require('gulp');
var clean = require('gulp-ejs2seajs');

gulp.task('ejs2seajs', function () {
    gulp.src('./src/js/**/tpls')
        .pipe(ejs2seajs())
        .pipe(gulp.dest('./src/'));
});
```
## Options

###tplname

Optional, name of the files created finally. Default to `tpls.js` if ignore this option.

```js
gulp.task('ejs2seajs', function () {
    gulp.src('./src/js/**/tpls')
        .pipe(ejs2seajs({ tplname: 'sth.js' }))
        .pipe(gulp.dest('./src/'));
});
```

> you can also read the [demo](https://github.com/VaJoy/gulp-ejs2seajs/tree/master/demo) for details.

## Grunt

Replace it to [grunt-ejs2seajs](https://github.com/charmingzuo/grunt-ejs2seajs) while using grunt.

P.S., this project was forked from [grunt-ejs2seajs](https://github.com/charmingzuo/grunt-ejs2seajs) to add reference processing.

## LICENSE
[MIT](http://en.wikipedia.org/wiki/MIT_License) @ VaJoy Larn
