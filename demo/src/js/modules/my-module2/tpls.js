define(function (require, exports, module) {
var __a={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'},
__b=/[&<>"']/g,
__e=function (s) {s = String(s);return s.replace(__b, function (m) {return __a[m]});},

tpls = module.exports = {
"item": function (data) {
var __p=[],_p=function(s){__p.push(s)};

var index = data.index || 0;
var item = data.item || '';
;_p('<li>The ');
;_p( index );
;_p('th item, content is <b>');
;_p(__e( item ));
;_p('</b></li>');

return __p.join("");
},
"page": function (data) {
var __p=[],_p=function(s){__p.push(s)};

var items = data.items || [];
;_p('\r\n\
<div class="wrap">\r\n\
    <h1>This is the sec page.</h1>\r\n\
    <ul>');
 for (var i = 0, l = items.length; i < l; i++) { ;_p('            ');
;_p( tpls.item({ index: i, item: items[i] }) );
;_p('        ');
 } ;_p('    </ul>\r\n\
</div>');

return __p.join("");
}}});