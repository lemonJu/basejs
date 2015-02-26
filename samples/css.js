define(function(require, exports, module) {

    module.id = "css";

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    var each = function(obj, callback) {
        for (var o in obj) {
            callback(o, obj[o]);
        }
    };
    var pfx = function(style) {
        //得到符合的前缀
        var s = "Webkit,Moz,O,ms,Khtml",
            pre = s.split(","),
            tNode = document.createElement("div");
        for (var i = 0; i < pre.length; i++) {
            //重新组装style
            var reStyle = pre[i] + style.charAt(0).toUpperCase() + style.substr(1);

            if (tNode.style[reStyle] != undefined) {
                return reStyle;
            }
        }

        return style;
    };

    exports.setCss = function(node, styles) {
        if (isArray(node)) {
            for(i=0;i<node.length;i++){
                for(var o in styles){
                    node[i].style[o] = styles[o];
                }
            }
        } else if (typeof styles === 'object') {
            each(styles, function(style_, value) {
                node.style[pfx(style_)] = value;
            });
        }
    };
    exports.getCss = function(node, style) {
        //兼容ie ff
        var styles = window.getComputedStyle ? window.getComputedStyle(node, null) : node.currentStyle;
        return styles[pfx(style)] === "auto" ? 0 : styles[pfx(style)];
    };

});
