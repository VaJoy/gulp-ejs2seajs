'use strict';

var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var through2 = require('through2');
var PluginError = gutil.PluginError;
var File = gutil.File;

module.exports = function (options) {
    return through2.obj(function (file, enc, cb) {

        var filepath = file.path;
        var cwd = file.cwd;
        var relative = path.relative(cwd, filepath).replace(/tpls$/,'');

        //文件不存在
        if ( !fs.existsSync(filepath) ) {
            this.emit('error', new PluginError('gulp-ejs2seajs',  'File not found: "' + filepath + '"'));
            cb();
            return;
        }

        if( !fs.statSync(filepath).isDirectory() ){
            this.emit('error', new PluginError('gulp-ejs2seajs',  'Target is not directory:"' + filepath + '"'));
            cb();
            return;
        }

        var files = fs.readdirSync(filepath)
            .filter(function (basename) {
                return /\.ejs$/.test(basename);
            })
            .map(function (basename) {
                var filename = path.join(filepath, basename),
                    ejsCode = fs.readFileSync(filename).toString();
                return {
                    name: basename,
                    code: ejsCode
                };
            });

        var modJsCode = parseFiles(files),
            destFile = relative + "tpls.js";

        var f = new gutil.File({
            cwd: '',
            base: '$$$vajoy',
            path: destFile,
            contents: new Buffer(modJsCode)
        });
        gutil.log('File "' + destFile + '" created.');

        this.push(f);
        cb();
    });

};

/**
 * 转换模版为模块（将模版内容创建独立的模块，并以require方式替换js模块中的引用）
 * @param {Array<{code:String, name:String}>} files js模块源码
 * @author jameszuo
 */
function parseFiles(files) {

    var tpls = files.map(function (f) {
        var name = f.name.replace(/\.[^/.]+$/, ''),
            code = f.code,
            fn = codeToFunction(code);

        return '"' + name + '": ' + fn.toString();
    }).join(',\n');

    return 'define(function (require, exports, module) {\n' +
        'var ' +
        "__a={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'},\n" +
        '__b=/[&<>"\']/g,\n' +
        '__e=function (s) {s = String(s);return s.replace(__b, function (m) {return __a[m]});},\n\n' +
        'tpls = module.exports = {\n' +
        tpls +
        '}' +
        '});';
}


/**
 * 转换模板代码为function
 * @param {String} code 子模板源码
 * @author jameszuo
 */
function codeToFunction(code) {
    if (!code) {
        return "function(){return ''}";
    }

    var regCode = /(?:(?:\r\n|\r|\n)\s*?)?<%([\-=]?)([\w\W\r\n]*?)%>(?:\r\n|\r|\n)?/gmi,
        index = 0,
        exec,
        len,
        res = ['var __p=[],_p=function(s){__p.push(s)};\n'],
        jscode,
        eq;

    while (exec = regCode.exec(code)) {

        len = exec[0].length;

        if (index !== exec.index) {
            res.push(";_p('");
            res.push(
                code
                    .slice(index, exec.index)
                    .replace(/\\/gmi, "\\\\")
                    .replace(/'/gmi, "\\'")
                    .replace(/\r\n|\r|\n/g, "\\r\\n\\\r\n")
            );
            res.push("');\r\n");
        }

        index = exec.index + len;

        eq = exec[1];
        jscode = exec[2];

        // escape html
        if (eq === '=') {
            res.push(';_p(__e(');
            res.push(jscode);
            res.push('));\r\n');
        }
        // no escape
        else if (eq === '-') {
            res.push(';_p(');
            res.push(jscode);
            res.push(');\r\n');
        } else {
            res.push(jscode);
        }
    }

    res.push(";_p('");
    res.push(
        code
            .slice(index)
            .replace(/\\/gmi, "\\\\")
            .replace(/'/gmi, "\\'")
            .replace(/\r\n|\r|\n/g, "\\r\\n\\\r\n")
    );
    res.push("');", '\r\n\r\n', 'return __p.join("");\r\n}', ',\r\n\r\n');
    res.length--;

    return ['function (data) {\r\n', res.join('')].join('');
}