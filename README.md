#开始使用basejs!
basejs模块加载器遵循cmd方式，开发者认为这种的方式能使你的模块移植到nodejs变得更加容易
在您进行测试的时候请把文件放在服务器上测试，如果有任何问题，您可以联系到我


###当前版本 0.1

fix bugs

+ when you write the 'require' in your annotation,scripts also will be loaded.
+ An error occurred when parameters are not written completely.

new features

+ 一个非常有用的函数-- config，你可以使用在来加载非cmd模块的脚本，只需要加脚本放在relay字段下，多个脚本加载时请使用数组的形式

```javascript  
basejs.config({      
	relay : "./samples/jquery-1.8.2.min.js",
	modules : "./samples/enter",
	callback : function(enter) {
		$("#title").html(enter.name).css({"animation":"testAnimate 2s infinite"});
	}
});
```

