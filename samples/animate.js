define(function(require, exports, module) {

    module.id = "animate";

    var css = require("css");

    var innerNode;
    var seed = 0;
    var Ways = {
        Linear: function(current, start, end, during) {
            return current + (end - start) / during * 16.7;
        },
        slower: function(current, start, end, during) {
            return current + Math.ceil((end - current) / 10);
        },
        faster: function(current, start, end, during) {
            return current + Math.ceil((current - start + 1) / 10);
        }
    };
    var AnimationFrame = function(fun) {
            setTimeout(function() {
                fun(true)
            }, 16.7)
        },
        isInQueues = false,
        slideUpNodes = [],
        cuNode,
        queues = [];
    var currentShouldFinal = false;
    var animate = (function() {

        var
        //入队列
            animate = function(node, params, objs) {
                innerNode = node || innerNode;

                node = node || innerNode;
                queues.push({
                    node: node,
                    params: params,
                    objs: objs
                });
                execute();
                return this;
            },

            //执行队列
            execute = function() {
                //出队列
                if (isInQueues || queues.length == 0) return;
                isInQueues = true;
                do
                    cuNode = QUE = queues.shift();
                while(!cuNode)
                var node = QUE['node'],
                    params = QUE['params'],
                    objs = QUE['objs'] || {};

                var callback = objs["callback"] || function() {},
                    time = objs["time"] || 1000,
                    copy = params,
                    ways = objs["ways"] || "Linear",
                    change = {},
                    oldStyles = {};
                var tempObj = {};
                for (var c in copy) {
                    oldStyles[c] = css.getCss(node, c);
                }
                var currentIsFinal = false;

                function run(sign) {
                    currentIsFinal = true;
                    var opacity;
                    for (var c in copy) {
                        var oParam = css.getCss(node, c) + "",
                            nParam = copy[c] + "",
                            oldParam = oParam.indexOf("px") == -1 ? oParam : parseFloat(oParam),
                            newParam = nParam.indexOf("px") == -1 ? nParam : parseFloat(nParam),
                            distinction = parseFloat(newParam - oldParam);
                        var zf = distinction / Math.abs(distinction);
                        if (!sign) change[c] = zf;

                        if (isNaN(distinction) || zf != change[c]) {
                            //结束属性
                            if (c == "opacity") {
                                css.setCss(node, {
                                    opacity: newParam
                                });
                                continue;
                            }
                            var px = isNaN(distinction) ? "" : "px";
                            tempObj = {};
                            tempObj[c] = newParam + px;
                            css.setCss(node, tempObj);
                            delete(copy[c]);
                            continue;
                        }
                        //执行到此，该属性没有结束，动画不应该结束
                        currentIsFinal = false;

                        var setParam = Ways[ways](parseFloat(oldParam), parseFloat(oldStyles[c]), newParam, time);
                        //if ((c == "width" || c == "height")){console.log(c+":"+setParam)}
                        if ((c == "width" || c == "height") && Math.abs(setParam) < 1) {
                            setParam = 0;
                        }
                        if (c == "opacity") {
                            tempObj = {};
                            tempObj[c] = setParam;
                            css.setCss(node, tempObj);
                        } else {
                            tempObj = {};
                            tempObj[c] = setParam + "px";
                            css.setCss(node, tempObj);
                        }
                    }
                    if (!currentIsFinal && !currentShouldFinal) {
                        AnimationFrame(run);
                    } else {
                        //退出权限
                        currentShouldFinal = false;
                        isInQueues = false;
                        callback();
                        execute();
                        return;
                    }

                }
                run();

            },
            fadeIn = function(node, objs) {
                animate(node, {
                    opacity: 1
                }, objs);
                return this;
            },
            fadeOut = function(node, objs) {
                animate(node, {
                    opacity: 0
                }, objs);
                return this;
            },
            slideUp = function(node, objs) {
                node = node || innerNode;
                css.setCss(node, {overflow:'hidden'});
                node.setAttribute("bjSup", css.getCss(node, "height"));
                animate(node, {
                    height: 0
                }, objs);
                return this;
            },
            slideDown = function(node, objs) {
                node = node || innerNode;
                var bjSup = node.getAttribute("bjSup");
                if (bjSup) {
                    animate(node, {
                        height: bjSup
                    }, objs);
                    return this;
                }

            },
            insertBefore = function(node, params, objs) {
                queues.unshift({
                    node: node,
                    params: params,
                    objs: objs
                });
                execute();
                return this;
            },
            //清空队列
            stop = function(node_) {
                if (node_) {
                    for (var i = 0; i < queues.length; i++) {
                        if (queues[i] && queues[i]["node"] === node_) {
                            delete queues[i];
                        }
                        if (cuNode && cuNode['node'] === node_)
                            currentShouldFinal = true;
                    }
                } else {
                    if (isInQueues) currentShouldFinal = true;
                    queues.length = 0;
                }

                return this;
            };

        return {
            animate: animate,
            fadeOut: fadeOut,
            fadeIn: fadeIn,
            stop: stop,
            innerNode: innerNode,
            slideDown: slideDown,
            slideUp: slideUp,
            insertBefore: insertBefore
        }

    })();
    module.exports = animate;
});
