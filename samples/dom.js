/**
 *@module core
 *@description 配置模块
 */
define(function(require, exports, module) {

    var css = require("css");
    var judge = require("judge");

    var
        makeArray = function(nodes) {
            var temps = [];
            for (var i = 0; i < nodes.length; i++) {
                temps.push(nodes[i]);
            }
            return temps;
        },
        getId = function(id) {
            var node = document.getElementById(id);
            return node;
        },

        //获取元素节点数组
        getTagName = function(tag, parentNode) {
            parentNode = parentNode || document;
            var tags = parentNode.getElementsByTagName(tag);
            return makeArray(tags);
        },

        //获取CLASS节点数组
        getClass = function(className, parentNode) {
            var tags, temps = [];
            parentNode = parentNode || document;
            if ("getElementsByClassName" in document) {
                tags = parentNode.getElementsByClassName(className);
            } else {
                var all = parentNode.getElementsByTagName('*');
                var index = 0;
                for (var i = 0; i < all.length; i++) {
                    if (all[i].className.indexOf(className) != -1) {
                        temps.push(all[i]);
                    }
                }
                return temps;
            }
            return makeArray(tags);
        };
    var extends_ = function(src, dest) {
        for (var i in src) {
            dest[i] = src[i];
        }
    };
    var Event = function(nodes, type, callback, sign) {
        var type = document.addEventListener ? type : 'on' + type;
        sign = sign || false;

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var addEvent = document.addEventListener ? node.addEventListener : node.attachEvent;
            (function(n) {
                addEvent.call(n, type, function(e) {
                    e.stopPropagation();
                    e = e || window.event;
                    e.target = e.target || e.srcElement;

                    callback.call(n, e);

                    return false;
                }, sign);
            })(node);
        }
    };

    var disEvent = function(nodes, type, callback, sign) {
        var type = document.addEventListener ? type : 'on' + type;
        sign = sign || false;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            removeEvent = document.removeEventListener ? node.removeEventListener : node.detachEvent;
            removeEvent.apply(node, [type, callback, sign]);
        }
    };

    var drag = function() {
        var nodes = [],
            currentNode,
            _callback = {
                dragComplete: function(srcNode, posi, curIndex) {},
                dragMoving: function(srcNode, posi, curIndex) {
                    srcNode.style["left"] = posi["x"] + "px";
                    srcNode.style["top"] = posi["y"] + "px";
                }
            },
            index = 0;

        var position = {};
        var
            inArray = function(node, arr) {
                for (var i in arr) {
                    if (arr[i] === node)
                        return true;
                }
                return false;
            },
            delegateDrag = function() {
                var _this = this;

                //事件绑定
                Event([document], "mousedown", function(e) {
                    var cNode = e.target || e.srcElement;

                    if (!inArray(cNode, _this.nodes)) return false;
                    //指定当前移动的元素
                    _this.currentNode = cNode;
                    _this.currentNode.style["zIndex"] = ++index;
                    position["x"] = e.offsetX || e.layerX;
                    position["y"] = e.offsetY || e.layerY;
                    _this.currentNode.style['cursor'] = "move";
                });

                Event([document], "mousemove", function(e) {
                    //得到位置
                    if (_this.currentNode) {
                        var x = e.pageX || e.clientX + document.body.scrollLeft,
                            y = e.pageY || e.clientY + document.body.scrollTop;
                        var posi = {};
                        posi["x"] = x - position["x"];
                        posi["y"] = y - position["y"];
                        _callback.dragMoving(_this.currentNode, posi, index);

                    }
                });

                Event([document], "mouseup", function(e) {
                    var cNode = e.target || e.srcElement;

                    if (_this.currentNode) {
                        var x = e.pageX || e.clientX + document.body.scrollLeft,
                            y = e.pageY || e.clientY + document.body.scrollTop,
                            posi = {};
                        posi["x"] = x - position["x"];
                        posi["y"] = y - position["y"];

                        //$('#console')[0].innerText = "12121212121";
                        _this._callback.dragComplete(_this.currentNode, posi, index);

                        _this.currentNode.style['cursor'] = "default";
                        _this.currentNode = null;
                    }

                });
            },
            init = function(nodes, obj) {
                //得到所有可以拖动的元素
                this.nodes = nodes;
                //继承自定义方法
                extends_(obj, _callback);
                delegateDrag.call(this);
            };

        return {
            nodes: nodes,
            currentNode: currentNode,
            _callback: _callback,
            init: init
        }
    }();
    /**
     *@method $
     *@param{object/string} 传入的css表达式
     *@return{Array-Like} 类数组
     *@description 模块入门
     */
    function $(args) {
        $.fn.init.prototype = $.fn;
        return new $.fn.init(args);
    }

    /**
     *@method $.makeQuery
     *@param{object} 需要遍历的对象
     *@param{function} 回调函数
     *@example $.makeQuery(obj);
     *@description 根据对象生成请求字符串
     */
    $.makeQuery = function(obj, sep) {
        sep = sep || "&";
        var url = "",
            i, temp;
        if (typeof obj === "object" && !obj.nodeType && !obj.window) {
            for (var o in obj) {
                temp = "";
                tempUrl = url == "" ? o + "=" : url + "&" + o + "=";
                if (Object.prototype.toString.call(obj[o]) === "[object Array]") {

                    for (i = 0; i < obj[o].length; i++) {
                        if (typeof obj[o][i] === "object") {
                            continue;
                        }
                        temp = temp == "" ? obj[o][i] : temp + "," + obj[o][i];
                    }
                    if (temp === "") continue;
                }
                url = temp != "" ? tempUrl + temp : tempUrl + obj[o];
            }
        }
        return url;
    };
    $.extends_ = function(src, dest) {
        extends_(src, dest);
    };

    $.judge = judge;
    /**
     *@method $.each
     *@param{object} 需要遍历的对象
     *@param{function} 回调函数
     *@example $.each(obj, function);
     *@description 遍历模块
     */
    $.each = function(obj, func) {
        if (!$.judge.decide("isArray", obj) && !$.judge.decide("isPlainObject", obj))
            throw new Error("not a array or object");
        for (var index in obj) {
            func(index, obj[index]);
        }
    };



    $.fn = $.prototype = {
        elems: [],
        init: function(args) {
            this.select(args);
        },
        select: function(args) {
            this.elems = [];
            if (typeof args === 'string') {
                //css模拟
                if (args.indexOf(' ') != -1) {
                    var elements = args.split(' ');
                    var childElements = []; //存放临时节点对象的
                    var node = []; //存放父节点
                    for (var i = 0; i < elements.length; i++) {
                        if (node.length == 0) node.push(document); //默认没有父节点入
                        switch (elements[i].charAt(0)) {
                            case '#':
                                childElements = []; //清理
                                childElements.push(getId(elements[i].substring(1)));
                                node = childElements; //保存父节点
                                break;
                            case '.':
                                childElements = [];
                                for (var j = 0; j < node.length; j++) {
                                    var temps = getClass(elements[i].substring(1), node[j]);
                                    for (var k = 0; k < temps.length; k++) {
                                        childElements.push(temps[k]);
                                    }
                                }
                                node = childElements;
                                break;
                            default:
                                childElements = [];
                                for (var j = 0; j < node.length; j++) {
                                    var temps = getTagName(elements[i], node[j]);
                                    for (var k = 0; k < temps.length; k++) {
                                        childElements.push(temps[k]);
                                    }
                                }
                                node = childElements;
                        }
                    }
                    this.elems = node;
                } else {
                    //find模拟
                    switch (args.charAt(0)) {
                        case '#':
                            this.elems.push(getId(args.substring(1)));
                            break;
                        case '.':
                            this.elems = getClass(args.substring(1));
                            break;
                        default:
                            this.elems = getTagName(args);
                    }
                }
            } else if (args && args.nodeType) {
                this.elems[0] = args;
            }

            this.length = this.elems.length;
            this.makeArray();
        },
        length: 0,
        each : function(func) {
            if(!$.judge.decide("isFunction", func)) func = new Function();
            $.each(this.elems, function(index, value){
                func.call(value,value);
            });
        },
        makeArray: function() {
            var elems = this.elems;
            for (var j = 0; j < elems.length; j++) {
                this[j] = elems[j];
            }
        },
        /**
         *@method $.fn.append
         *@param{string} 需要追加的html
         *@example $.fn.append("<div></div>");
         *@description 根据对象生成请求字符串
         *@return{Array-Like} 对象本身
         */
        append: function(html) {
            for (var i = 0; i < this.elems.length; i++) {
                this.elems[i].innerHTML = this.elems[i].innerHTML + html;
            }
        },
        /**
         *@method $.fn.find
         *@param{string} 子元素表达式
         *@example $.fn.find(".test");
         *@description 向下寻找指定的子元素
         *@return{Array-Like} 对象本身
         */
        find: function(str) {
            var childElements = [];
            for (var i = 0; i < this.elems.length; i++) {
                switch (str.charAt(0)) {
                    case '#':
                        childElements.push(getId(str.substring(1)));
                        break;
                    case '.':
                        var temps = getClass(str.substring(1), this.elems[i]);
                        for (var j = 0; j < temps.length; j++) {
                            childElements.push(temps[j]);
                        }
                        break;
                    default:
                        var temps = getTagName(str, this.elems[i]);
                        for (var j = 0; j < temps.length; j++) {
                            childElements.push(temps[j]);
                        }
                }
            }

            this.elems = childElements;
            this.makeArray();
            return this;
        },
        parentsNear : function(str) {
            var childElements = [], parNode, i, curNode;
            for(i = 0;i < this.elems.length ;i ++) {
                curNode = this.elems[i];
                while((parNode = curNode.parentNode) && parNode.nodeType) {
                    if($(parNode).hasClass(str) || parNode.id.toLowerCase() == str || parNode.nodeName.toLowerCase() == str) {
                        childElements.push(parNode);
                        break;
                    }
                    curNode = parNode;
                }
            }

            this.elems = childElements;
            this.makeArray();
            return this;
        },
        /**
         *@method $.fn.get
         *@param{Integer} 下标
         *@example $.fn.get(0);
         *@description 返回指定下标的元素
         *@return{Array-Like} 对象本身
         */
        get: function(index) {
            return index === undefined ? Array.prototype.slice.call(this) : this[index];
        },
        /**
         *@method $.fn.setCss
         *@param{object} 需要设置的CSS
         *@example $.fn.setCss({width:'100px'});
         *@description 设置CSS
         *@return{Array-Like} 对象本身
         */
        setCss: function(styles) {
            css.setCss(this.elems, styles);
            return this;
        },
        /**
         *@method $.fn.getCss
         *@param{string} 需要得到的CSS
         *@example $.fn.getCss('width');
         *@description 返回第一个元素的css
         *@return{Array-Like} 对象本身
         */
        getCss: function(styles) {
            return css.getCss(this.elems[0], styles);
        },

        hasClass: function(cls) {
            if(typeof cls === "string" && this.elems[0] && this.elems[0].nodeType)
                return this.elems[0].className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
            return false;
        },

        addClass: function(cls) {
            if (!this.hasClass(cls)) this.elems[0].className += " " + cls;
            return this;
        },

        removeClass: function(cls) {
            if (this.hasClass(cls)) {
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                this.elems[0].className = this.elems[0].className.replace(reg, ' ');
            }
            return this;
        },
        /**
         *@method $.fn.bind
         *@param{string} 事件类型
         *@example $.fn.bind('click',function);
         *@description 绑定事件
         *@return{Array-Like} 对象本身
         */
        bind: function(type, fun) {
            if(!this.elems || this.elems.length == 0) return;
            Event(this.elems, type, fun);
            return this;
        },
        /**
         *@method $.fn.unbind
         *@param{string} 事件类型
         *@example $.fn.unbind('click',function);
         *@description 接触绑定事件
         *@return{Array-Like} 对象本身
         */
        unbind: function(type, fun) {
            disEvent(this.elems, type, fun);
            return this;
        },
        /**
         *@method $.fn.click
         *@param{function} 事件处理函数
         *@example $.fn.click(function);
         *@description 绑定单击事件
         *@return{Array-Like} 对象本身
         */
        click: function(fun) {
            return this.bind("click", fun)
        },
        dblclick: function(fun) {
            return this.bind("dblclick", fun)
        },
        mousedown: function(fun) {
            return this.bind("mousedown", fun)
        },
        mouseup: function(fun) {
            return this.bind("mouseup", fun)
        },
        mouseover: function(fun) {
            return this.bind("mouseover", fun)
        },
        mousemove: function(fun) {
            return this.bind("mousemove", fun)
        },
        mouseout: function(fun) {
            return this.bind("mouseout", fun)
        },
        keypress: function(fun) {
            return this.bind("keypress", fun)
        },


        keydown: function(fun) {
            return this.bind("keydown", fun)
        },
        keyup: function(fun) {
            return this.bind("keyup", fun)
        },
        focus: function(fun) {
            return this.bind("focus", fun)
        },
        submit: function(fun) {
            return this.bind("submit", fun)
        },
        change: function(fun) {
            return this.bind("change", fun)
        },

        reset: function(fun) {
            return this.bind("reset", fun)
        },

        drag: function(obj) {
            drag.init(this.elems, obj);
            return this;
        },

        touchstart: function(fun) {
            return this.bind("touchstart", fun)
        },

        touchmove: function(fun) {
            return this.bind("touchmove", fun)
        },

        hover: function(fun1, fun2) {
            for (var i = 0; i < this.elems.length; i++) {
                this.bind("mouseover", fun1);
                this.bind("mouseout", fun2);
            }

            return this;
        },
        html: function(text) {
            if (typeof text === "string") {
                for (var i = 0; i < this.elems.length; i++) {
                    this.elems[i].innerHTML = text;
                }
            } else {
                var node = this.elems[0];
                return node.innerHTML;
            }
            return this;
        },
        text: function(text) {
            var textContent = document.body.textContent ? "textContent" : "innerText";
            if (text) {
                for (var i = 0; i < this.elems.length; i++) {
                    this.elems[i][textContent] = text;
                }
            } else {
                var node = this.elems[0];
                return node[textContent];
            }
            return this;
        },
        attr: function(attr, value) {
            if (typeof value != "undefined") {
                for (var i = 0; i < this.elems.length; i++) {
                    typeof this.elems[i][attr] !== "undefined" ? this.elems[i][attr] = value : this.elems[i].setAttribute(attr, value);
                }
            } else {
                return this.elems[0][attr] || this.elems[0].getAttribute(attr);
            }
            return this;
        },

        offset: function() {
            var node = this.elems[0],
                left = node.offsetLeft,
                top = node.offsetTop;
            return {
                left: left,
                top: top
            }
        },
        val: function(text) {
            if (typeof text === "string") {
                for (var i = 0; i < this.elems.length; i++) {
                    this.elems[i]["value"] = text;
                }
            } else {
                return this.elems[0]["value"];
            }
            return this;
        },
        removeAttr : function(attr){
            for (var i = 0; i < this.elems.length; i++) {
                this.elems[i].removeAttribute(attr);
            }
        }

    };




    module.exports = $;
});
