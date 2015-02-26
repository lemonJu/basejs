define(function(require, exports, module) {
    module.id = "ajax";
    var parseJSON = function(str) {
        if (typeof(str) !== "string") return str;
        if (window.JSON) return JSON.parse(str);

        // avoid xss
        return (new Function("return" + str))();
    };
    var createXhr = function() {
            var xmlHttp;
            if (window.ActiveXObject) xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            else xmlHttp = new XMLHttpRequest();
            return xmlHttp;
        },
        ajax = function(setting) {
            var method = setting.method || "post",
                callback = setting.success || function() {},
                params = setting.params || "",
                dataType = setting.dataType || "",
                beforeSend = setting.beforeSend || undefined,
                asnyc = setting.asnyc || true,
                error = setting.error || function() {},
                url = setting.url || function() {},
                xhr = createXhr();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (dataType == "json")
                        callback.call(this, parseJSON(xhr.responseText));
                    else
                        callback.call(this, xhr.responseText);
                } else if (xhr.readyState == 1 && beforeSend) {
                    beforeSend.call(this, xhr);
                }
            };

            xhr.open(method.toUpperCase(), setting.url, asnyc);
            if (method == "post")
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            xhr.send(params);
        },
        post = function(url, params, callback) {
            ajax({
                "url": url,
                "params": params,
                "success": callback
            });
        },
        get = function(url, params, callback) {
            ajax({
                "method": "get",
                "url": url,
                "params": params,
                "success": callback
            });
        },
        getJSON = function(url, params, callback) {
            ajax({
                "method": "post",
                "dataType": "json",
                "url": url,
                "params": params,
                "success": callback
            });
        };
    module.exports = {
        ajax: ajax,
        post: post,
        get: get,
        getJSON: getJSON
    }
});
