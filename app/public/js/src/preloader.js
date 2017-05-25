var Preloader = function(userParams) {
	// default params
	var params = {
		preloaderId: "preloader",
		outerCircleBackground: "#e3e1d7",
		innerCircleBackground: "#f6f5ee",
		rotationSpeed: "1.7s",
		spinnerBackgroundColor : "#fc5821",
		outerCircleWidth : 76,
		innerCircleWidth : 48
	}

	// extend defualts to params here
	$.extend(params,userParams);

	var outerCircle = document.createElement("div");
	var innerCircle = document.createElement("div");
	var spinner = document.createElement("div");
	var preloaderElem = $("#"+params.preloaderId);

	var initOuterCircle = function(diam) {
		outerCircle.style.borderRadius = "50%";
		outerCircle.style.width = diam + "px";
		outerCircle.style.height = diam + "px";
		outerCircle.style.background = params.outerCircleBackground;
		outerCircle.style.boxShadow = "rgb(215, 212, 199) 1px 1px 0px inset, white -3px 1px 2px";
		outerCircle.style.position = "absolute";
	}

	var initInnerCircle = function(diam) {
		innerCircle.style.borderRadius = "50%";
		innerCircle.style.width = diam + "px";
		innerCircle.style.height = diam + "px";
		innerCircle.style.background = params.innerCircleBackground;
		innerCircle.style.position = "absolute";
		innerCircle.style.boxShadow = "rgb(215, 212, 199) 1px 2px 0px, white -3px 1px 1px inset";
		var outerWidth = getPX(outerCircle.style.width)
		innerCircle.style.top = ((outerWidth-diam)/2) + "px";
		innerCircle.style.left = ((outerWidth-diam)/2) + "px";
	}

	var getPX = function(pxStr) {
		return pxStr.split("px")[0];
	}

	var initSpinner = function(spinnerWidth) {
		spinner.className = "spinner"
		spinner.style.animation = "rotate "+(params.rotationSpeed) +" linear 0s  infinite";
		spinner.style.position = "absolute"
		spinner.style.display = "inline-block"

		spinner.style.boxShadow= "rgb(198, 196, 183) -1px -1px 2px inset, white -1px 0px 0px inset";
		spinner.style.backgroundColor = params.spinnerBackgroundColor;
		spinner.style.borderRadius = "100%";

		var outerWidth = getPX(outerCircle.style.width);
		var innerWidth = getPX(innerCircle.style.width)
		var spinnerWidth = ((outerWidth - innerWidth)/2 -2) +"px";
		spinner.style.width = spinnerWidth;
		spinner.style.height = spinnerWidth;
		var offset = (innerWidth/2-getPX(spinnerWidth)/2);
		spinner.style.top =  offset + "px";
		spinner.style.left = offset + "px";
	}

	var initRules = function() {
		if ($('#rotateAnimation').length) $("#rotateAnimation").remove();
		var cssAnimation = document.createElement('style');
		cssAnimation.type = 'text/css';
		var outerWidth = getPX(outerCircle.style.width);
		var innerWidth = getPX(innerCircle.style.width);
		var spinnerWidth = getPX(spinner.style.width);
		var translatePx = innerWidth/2+spinnerWidth/2+((outerWidth-innerWidth-2*spinnerWidth)/4);
		var rules = document.createTextNode('@keyframes rotate {'+
			'from{transform:rotate(0deg) translate('+translatePx+'px) rotate(0deg);}'+
			'to{transform:rotate(360deg) translate('+translatePx+'px) rotate(-360deg);}'+
		'}'+
		' @-webkit-keyframes rotate {'+
			'from{transform:rotate(0deg) translate('+translatePx+'px) rotate(0deg);}'+
			'to{transform:rotate(360deg) translate('+translatePx+'px) rotate(-360deg);}'+
		'}');
		cssAnimation.appendChild(rules);
		cssAnimation.id = "rotateAnimation";
		$('head')[0].appendChild(cssAnimation);
	}

	var init = function() {
		$("#preloader").empty();
		initOuterCircle(params.outerCircleWidth);
		initInnerCircle(params.innerCircleWidth);
		initSpinner();
		initRules();
		innerCircle.appendChild(spinner);
		outerCircle.appendChild(innerCircle);
		preloaderElem.append(outerCircle);
	}
	$(window).resize(function() {
		init();
	})
	init();
}
