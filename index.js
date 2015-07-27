'use strict';

var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var through = require('through2');
var PluginError = gutil.PluginError;
var File = gutil.File;


module.exports = function(opt){

    opt = opt || {};
    opt.path || (opt.path = 'tpls.js');

    var files = [],
        dirname;


    function bufferContents(file, enc, cb) {
        //ľ���ļ�
        if (file.isNull()) {
            cb();
            return;
        }

        //��֧��Stream
        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-ejs2seajs',  'Streaming not supported'));
            cb();
            return;
        }

        var ejsCode = fs.readFileSync(file.path).toString(),
            basename = path.basename(file.path),
            f = {
                name: basename,
                code: ejsCode

            };

        !dirname && (dirname = path.dirname(file.path));

        files.push(f);

        cb();
    }




    function endStream(cb) {
        //û��������ļ�
        if (!files.length) {
            cb();
            return;
        }

        opt.path = path.relative(process.cwd(), (dirname.replace(/[^\\]+$/,'') + opt.path)).replace(/^[^\\]+\\/,'');

        var tplsFile = new File(opt);
        tplsFile.contents = new Buffer(parseFiles(files));

        this.push(tplsFile);
        cb();
    }


    /**
     * ת��ģ��Ϊģ�飨��ģ�����ݴ���������ģ�飬����require��ʽ�滻jsģ���е����ã�
     * @param {Array<{code:String, name:String}>} files jsģ��Դ��
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
     * ת��ģ�����Ϊfunction
     * @param {String} code ��ģ��Դ��
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


    return through.obj(bufferContents, endStream);
};