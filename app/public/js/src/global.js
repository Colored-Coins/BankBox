var coloredcoins
var satoshee = 100000000;
var lastTxidRefreshed = ''

if ('undefined' !== typeof io) {
	var socket = io();
}

(function(){

  if ("performance" in window == false) {
	  window.performance = {};
  }
  
  Date.now = (Date.now || function () {  // thanks IE8
	return new Date().getTime();
  });

  if ("now" in window.performance == false){
	
	var nowOffset = Date.now();
	
	if (performance.timing && performance.timing.navigationStart){
	  nowOffset = performance.timing.navigationStart
	}

	window.performance.now = function now(){
	  return Date.now() - nowOffset;
	}
  }

})();

function delete_object(obj, type, id) {
	if (confirm("Are You Sure?")) {
		$.ajax({
			url: "/dashboard/admin/delete_object",
			data: {id: id, type: type},
			dataType : "json",
			method: "DELETE"
		})
		.success(function (ret) {
			if (obj)
				obj.api().ajax.reload();
		})
		.fail(function (ret) {
			alert("failed to remove object");
		})
	}
}

Array.prototype.containsByProp = function(propName, value){
	  for (var i = this.length - 1; i > -1; i--) {
		var propObj = this[i];
		  if(propObj[propName] === value) {
			return true;
		}
	  }
	return false;
}

function d2h(d) {
		return d.toString(16);
}

function h2d (h) {
		return parseInt(h, 16);
}

function stringToHex (tmp) {
		var str = '',
				i = 0,
				tmp_len = tmp.length,
				c;
		
		for (; i < tmp_len; i += 1) {
				c = tmp.charCodeAt(i);
				str += d2h(c) + ' ';
		}
		return str;
}

function hexToString (tmp) {
		var arr = tmp.split(' '),
				str = '',
				i = 0,
				arr_len = arr.length,
				c;
		
		for (; i < arr_len; i += 1) {
				c = String.fromCharCode( h2d( arr[i] ) );
				str += c;
		}
		
		return str;
}

function animateMaze (path, length, time, text) {
	path.animate(length, {
		duration: time,
		step: function(state, path, attachment) {
			var perc = path.value() * 100;
			text.innerHTML = perc.toFixed(0)+'%';
		}
	});
}

function deleteCookie( key ) {
	date = new Date();
	date.setDate(date.getDate() -1);
	document.cookie = escape(key) + '=;expires=' + date +';path=/;';
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(c_name) {
		var c_value = document.cookie,
				c_start = c_value.indexOf(" " + c_name + "=");
		if (c_start == -1) c_start = c_value.indexOf(c_name + "=");
		if (c_start == -1) {
				c_value = null;
		} else {
				c_start = c_value.indexOf("=", c_start) + 1;
				var c_end = c_value.indexOf(";", c_start);
				if (c_end == -1) {
						c_end = c_value.length;
				}
				c_value = unescape(c_value.substring(c_start, c_end));
		}
		return c_value;
}

function escapeHtml(string) {
	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};

	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}

function simpleAssetMeta(asset, defaultIcon) {
	var meta = asset.metadataOfIssuence && asset.metadataOfIssuence.data;
	var urls = asset.metadataOfIssuence && asset.metadataOfIssuence.data && asset.metadataOfIssuence.data.urls || [];
	
	var assetName = "";
	var assetDesc = "";
	var issuer = "";
	
	var smallIcon = "";
	var largeIcon = "";
	
	if (meta) {
		assetName = meta.assetName || asset.assetId;
		assetDesc = meta.description;
		issuer = meta.issuer || "N/A";
	}

	urls.forEach(function (metaurl) {
		if (metaurl.name == "icon") {
			smallIcon = metaurl.url;
		}
		
		if (metaurl.name == "icon_large") {
			largeIcon = metaurl.url;
		}
	});
	
	var assetImage = largeIcon || smallIcon || defaultIcon;

	var assetMeta = {name: assetName, desc: assetDesc, icon: assetImage, issuer: issuer};
	
	return assetMeta;
}

function getMetaIcon(arr) {
	for (i = 0 ; i < arr.length ; i++) {
		if (arr[i].name == "icon") {
			return arr[i];
		}
	}

	return false;
}

function sayswho() {
	var ua= navigator.userAgent, tem,
	M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if(/trident/i.test(M[1])){
			tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
			return 'IE '+(tem[1] || '');
	}
	if(M[1]=== 'Chrome'){
			tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
			if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
	}
	M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
	return M.join(' ');
}

function checkBrowser() {
	var browser = sayswho();
	if (browser.indexOf("Chrome") == -1 && !localStorage.browserIgnore) {
		// show incopatible screen
		$("#incopatible").show();
	}
}

function browserIgnore() {
	localStorage.browserIgnore = 1;
	$("#incopatible").hide();
}

function ArrNoDupe(a) {
		var temp = {};
		for (var i = 0; i < a.length; i++)
			temp[a[i]] = true;
		var r = [];
		for (var k in temp)
			r.push(k);
		return r;
}

var decodeEntities = (function() {
	// this prevents any overhead from creating the object each time
	var element = document.createElement('div');

	function decodeHTMLEntities (str) {
	if(str && typeof str === 'string') {
		// strip script/html tags
		str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
		str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
		element.innerHTML = str;
		str = element.textContent;
		element.textContent = '';
	}

	return str;
	}

	return decodeHTMLEntities;
})();