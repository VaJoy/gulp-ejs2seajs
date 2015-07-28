define(function (require, exports, module) {

    var tpls = require('./tpls');

    module.exports = {

        render: function () {
            var html = tpls.page({
                items: [
                    '<hello>',
                    '"seajs"',
                    '&and&',
                    '\'ejs\''
                ]
            });
            document.getElementById('container').innerHTML = html;

            document.getElementById('debug').value = html;
        }

    };


});