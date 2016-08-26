;(function($) {
	$('body').append('<div id="zoom"><a class="close"></a><a href="#previous" class="previous"></a><a href="#next" class="next"></a><div class="content loading"></div></div>');

	var zoom = $('#zoom').hide(),
	    zoomContent = $('#zoom .content'),	//大图面板
	    overlay = '<div class="overlay"></div>',
	    zoomedIn = false,
	    openedImage = null,
	    windowWidth = $(window).width(),	//设备宽度
	    windowHeight = $(window).height();

	// event只在事件发生的有效,代表事件本身。this是事件中的对象
	function open(event) {

		console.log(event);
		console.log(this);
		if (event) {
			event.preventDefault();
		}
		var link = $(this),
		    src = link.attr('href');
		if (!src) {
			return;
		}
		var image = $(new Image()).hide();
		$('#zoom .previous, #zoom .next').show();
		if (link.hasClass('zoom')) {
			$('#zoom .previous, #zoom .next').hide();
		}
		if (!zoomedIn) {
			zoomedIn = true;
			zoom.show();
			$('body').addClass('zoomed');
		}
		//这里有待优化，可以试着用css动画来代替
		// zoomContent.html(image).delay(100).addClass('loading');
		zoomContent.html(image);
		// zoomContent.prepend(overlay);
		image.load(render).attr('src', src);
		openedImage = link;
		
		function render() {
			var image = $(this),
			    borderWidth = parseInt(zoomContent.css('borderLeftWidth')),
			    maxImageWidth = windowWidth - (borderWidth * 2),
			    maxImageHeight = windowHeight - (borderWidth * 2),
			    imageWidth = image.width(),
			    imageHeight = image.height();
			if (imageWidth == zoomContent.width() && imageWidth <= maxImageWidth && imageHeight == zoomContent.height() && imageHeight <= maxImageHeight) {
					show(image);
					return;
			}
			if (imageWidth > maxImageWidth || imageHeight > maxImageHeight) {
				var desiredHeight = maxImageHeight < imageHeight ? maxImageHeight : imageHeight,
				    desiredWidth  = maxImageWidth  < imageWidth  ? maxImageWidth  : imageWidth;
				if ( desiredHeight / imageHeight <= desiredWidth / imageWidth ) {
					image.width(Math.round(imageWidth * desiredHeight / imageHeight));
					image.height(desiredHeight);
				} else {
					image.width(desiredWidth);
					image.height(Math.round(imageHeight * desiredWidth / imageWidth));
				}
			}
			zoomContent.animate({
				width: image.width(),
				height: image.height(),
				marginTop: -(image.height() / 2) - borderWidth,
				marginLeft: -(image.width() / 2) - borderWidth
			}, 200, function() {
				show(image);
			});

			function show(image) {
				image.show();
				zoomContent.removeClass('loading');
				hammer();   //调用hammer，用于放大缩小图片
			}
		}
	}
	
	function openPrevious() {
		var prev = openedImage.parent('div').prev();
		if (prev.length == 0) {
			prev = $('.gallery div:last-child');
		}
		prev.find('a').trigger('click');
	}
	
	function openNext() {
		var next = openedImage.parent('div').next();
		if (next.length == 0) {
			next = $('.gallery div:first-child');
		}
		next.children('a').trigger('click');
	}
		
	function close(event) {
		if (event) {
			event.preventDefault();
		}
		zoomedIn = false;
		openedImage = null;
		zoom.hide();
		$('body').removeClass('zoomed');
		zoomContent.empty();
	}
	
	function changeImageDimensions() {
		windowWidth = $(window).width();
		windowHeight = $(window).height();
	}
	
	(function bindNavigation() {
		zoom.on('click', function(event) {
			event.preventDefault();
			if ($(event.target).attr('id') == 'zoom') {
				close();
			}
		});
		
		$('#zoom .close').on('click', close);
		$('#zoom .previous').on('click', openPrevious);
		$('#zoom .next').on('click', openNext);
		$(document).keydown(function(event) {
			if (!openedImage) {
				return;
			}
			if (event.which == 38 || event.which == 40) {
				event.preventDefault();
			}
			if (event.which == 27) {
				close();
			}
			if (event.which == 37 && !openedImage.hasClass('zoom')) {
				openPrevious();
			}
			if (event.which == 39 && !openedImage.hasClass('zoom')) {
				openNext();
			}
		});

		if ($('.gallery a').length == 1) {
			$('.gallery a')[0].addClass('zoom');
		}
		$('.zoom, .gallery a').on('click', open);
	})();

	(function bindChangeImageDimensions() {
		$(window).on('resize', changeImageDimensions);
	})();

	//处理滚轮,屏蔽pc端用鼠标滚轮，即无法放大图片
	(function bindScrollControl() {
		$(window).on('mousewheel DOMMouseScroll', function(event) {
			if (!openedImage) {
				return;
			}
			event.stopPropagation();  //阻止当前事件在DOM树上冒泡
			event.preventDefault();
			event.cancelBubble = false;  //取消事件处理,停止事件继续上传
		});
	})();
})(jQuery);
