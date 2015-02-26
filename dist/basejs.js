! function(global) {
    var $code = {}, //缓存代码
        $result = {}, //保存执行js后得到的object
        $relevance = {}; //模块之间依赖关系

    /**
     * ajax函数 仅get方法
     */
    var $get = (function() {
        function getXhr() {
            var xmlHttp;
            if (window.ActiveXObject) xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            else xmlHttp = new XMLHttpRequest();
            return xmlHttp
        }

        function sender(url, params, onComplete, xhr) {
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    onComplete.call(this, xhr.responseText)
                }
            }
            xhr.open("GET", url, true);
            xhr.send(params)
        }

        return function(url, params, onComplete) {
            var xhr = getXhr();
            sender(url, params, onComplete, xhr)
        }

    })();

    var $exeCode = window.execScript || window.eval,
        isIE = !!(window.attachEvent && !window.opera);

    /**
     * part = util.js
     */
    var util = {};
    util._j = function(type) {
        return function(element) {
            return Object.prototype.toString.call(element) === "[object " + type + "]"
        }
    }
    util.isString = util._j("String");
    util.isArray = util._j("Array");
    util.isFunction = util._j("Function");
    util.isObject = util._j("Object");
    util.isWindow = util._j("Window");
    util.each = function(src, callback) {
        var i;
        for (i in src) callback(i, src[i])
    };
    util.isPlainObject = function(e) {
        if (e.nodeType || typeof e != "object" || isWindow(e)) {
            return false
        }
        return true
    }


    //转换相对路径为完整路径
    function getRealAddr(e) {
        if (!/\.js$/.test(e)) e = e + ".js"
        if (/\/\//.test(e)) return e
        var r = window.location,
            n = r.port == "" ? "" : ":" + r.port,
            t = r.origin || r.protocol + "//" + r.host + n,
            a = r.href.replace(t, "").split("/");
        a[0] = t;
        lstPage = e.match(/\.\.\//g);
        e = e.replace("../", "").replace("./", "")
        if (lstPage) {
            if (lstPage.length < a.length - 1) {
                a.length = a.length - lstPage.length - 1;
                return a.join("/") + "/" + e
            } else {
                throw new Error("Addr Is InValid")
            }
        }
        a.length = a.length - 1;
        return a.join("/") + "/" + e
    }

    /**
     * 加载js文件
     * @params array
     * @params function
     */
    function loadJs(urls, onComplete) {
        //外部调用必须指定r[回调]
        var i,
            loading = loaded = 0,
            releies, //依赖
            real, // js文件真实路径
            url; // ajax调用的url
        var annotationReg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;

        real = getRealAddr(urls)
            //如果没有加载依赖
        if (!$code[real]) {
            loading++;
            $get(real, "", function(codes) {
                loaded++;
                url = this.responseURL;
                // 去注释的文本  
                codes = codes.replace(annotationReg, function(word) {
                    return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
                }).replace("define(", 'define("' + url + '",');;

                // 保存编译后的源码
                $code[url] = codes;
                // 初始化依赖对象
                $relevance[url] = [];

                releies = codes.match(/require\(\".*?\"/g) || [];
                util.each(releies, function(key, value) {
                    value = value.replace("require(", "").replace(/\"/gim, "");
                    $relevance[url].push(getRealAddr(value))
                })

                if ($relevance[url].length > 0) {
                    //转换依赖
                    util.each($relevance[url], function(key, value) {
                        value = value.replace(/require\(/, "").replace(/\"/g, "");
                        loadJs(value, onComplete);
                    })

                } else {
                    // 检查是否加载完毕
                    // $relevance为{}

                    if (loading == loaded) {
                        util.each($relevance, function(key, value) {
                            loadRelay(key);
                        })
                        onComplete()
                    }
                }
            })
        }
    }



    /**
     * 解析依赖并执行
     * @param string js文件的路径
     */
    function loadRelay(src) {
        if (!$relevance[src]) return
            //判断依赖关系
        if ($relevance[src].length > 0) {
            //递归调用依赖
            for (i in $relevance[src]) {
                loadRelay($relevance[src][i])
            }
        }

        $exeCode($code[src]);
        delete $relevance[src]

    }

    /**
     * 加载非cmd模块
     * @param string 需要加载模块
     * @param function 回调函数
     */
    function loadNoneOfCmd(jser, onComplete) {
        var loaded = loading = 0;
        var real;

        onComplete = onComplete || function() {}

        if (!jser || !jser.length || jser.length < 1) {
            return onComplete()
        }

        loading = jser.length

        uitl.each(jser, function(key, value) {
            real = getRealAddr(key);
            $get(real, "", function(data) {
                loaded++;
                exeCode(data);
                if (loading == loaded) {
                    return onComplete()
                }
            })
        })
    }

    function require(url) {
        url = getRealAddr(url);
        return $result[url] ? $result[url] : ""
    }
    require.resolve = getRealAddr;

    /**
     * @method async
     * @static
     * @param e {object} 加载的信息，包括依赖relay(array)，模块modules(array)以及回调函数callback
     * @chainable
     * @return {object} 返回自身
     */
    var async = require.async = function(e, callback) {
            var relay = relayScripts || [];

            var modules = e;
            if (isString(modules)) {
                modules = [modules]
            }

            loadNoneOfCmd(relay, function() {
                for (var t in relay) {
                    relayLoad(relay[t]);
                }
                relayScripts = undefined;
                //加载模块
                load(modules, function() {
                    var back = [];
                    for (var t in modules) {
                        loadRelay(modules[t]);
                        back.push($result[getRealAddr(modules[t])])
                    }
                    callback.apply(null, back)
                });
            });

        }
        
    var define = global.define = function(url, r) {
        var module = {
            exports: {},
            uri: url,
            id: ""
        }
        if (arguments.length < 2) return;
        if (util.isString(r) || util.isPlainObject(r)) {
            module.exports = r
        } else if (util.isFunction(r)) {
            var t = r.call(this, require, module.exports, module);
            module.exports = !!t ? t : module.exports
        }

        $result[url] = module.exports
    }

    /**
     * 程序初始化的额配置
     */
    function config(e) {
        var relay = e.relay || [],
            modules = e.modules || [],
            callback = e.callback || null;
        if (util.isString(relay)) relay = [relay];
        if (util.isString(modules)) modules = [modules];
        if (!callback) {
            //如果没有指定回调则不在此加载依赖
            relayScripts = relay;
            return;
        }
        
        //加载依赖
        loadNoneOfCmd(relay, function() {
            //加载模块
            util.each(modules, function(key, value) {
                value = getRealAddr(value)
                loadJs(value, function() {
                    var back = [];
                    for (var t in modules) {
                        back.push($result[getRealAddr(modules[t])])
                    }
                    callback.apply(null, back)
                })
            })

        })

        return this
    }


    define.cmd = {};

    var ME = document.getElementById("bjsElement") || (function() {
        return document.getElementsByTagName("script")[0];
    })();

    var sPoint = ME.getAttribute("data-start");

    if (sPoint) {
        loadJs(sPoint, function() {
            console.log("success")
                //loadRelay(enterAddr)
        })
    }

    global.basejs = {
        async: async,
        config: config
    }
}(this);
