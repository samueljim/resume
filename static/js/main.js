/** 
 * ===================================================================
 * main js
 *
 * ------------------------------------------------------------------- 
 */

(function ($) {

	"use strict";

	/*---------------------------------------------------- */
	/* Preloader
	------------------------------------------------------ */
	$(window).load(function () {

		// will first fade out the loading animation 
		$("#loader").fadeOut("slow", function () {

			// will fade out the whole DIV that covers the website.
			$("#preloader").delay(300).fadeOut("slow");

		});

	})


	/*---------------------------------------------------- */
	/* FitText Settings
	------------------------------------------------------ */
	setTimeout(function () {

		$('#intro h1').fitText(1, {
			minFontSize: '42px',
			maxFontSize: '84px'
		});

	}, 100);


	/*---------------------------------------------------- */
	/* FitVids
	------------------------------------------------------ */
	$(".fluid-video-wrapper").fitVids();


	/*---------------------------------------------------- */
	/* Owl Carousel
	------------------------------------------------------ */
	$("#owl-slider").owlCarousel({
		navigation: false,
		pagination: true,
		itemsCustom: [
			[0, 1],
			[700, 2],
			[960, 3]
		],
		navigationText: false
	});


	/*----------------------------------------------------- */
	/* Alert Boxes
  	------------------------------------------------------- */
	$('.alert-box').on('click', '.close', function () {
		$(this).parent().fadeOut(500);
	});


	/*----------------------------------------------------- */
	/* Stat Counter
  	------------------------------------------------------- */
	var statSection = $("#stats"),
		stats = $(".stat-count");

	statSection.waypoint({

		handler: function (direction) {

			if (direction === "down") {

				stats.each(function () {
					var $this = $(this);

					$({
						Counter: 0
					}).animate({
						Counter: $this.text()
					}, {
						duration: 4000,
						easing: 'swing',
						step: function (curValue) {
							$this.text(Math.ceil(curValue));
						}
					});
				});

			}

			// trigger once only
			this.destroy();

		},

		offset: "90%"

	});


	/*---------------------------------------------------- */
	/*	Masonry
	------------------------------------------------------ */
	var containerProjects = $('#folio-wrapper');

	containerProjects.imagesLoaded(function () {

		containerProjects.masonry({
			itemSelector: '.folio-item',
			resize: true
		});

	});


	/*----------------------------------------------------*/
	/*	Modal Popup
	------------------------------------------------------*/
	$('.item-wrap a').magnificPopup({

		type: 'inline',
		fixedContentPos: false,
		removalDelay: 300,
		showCloseBtn: false,
		mainClass: 'mfp-fade'

	});

	$(document).on('click', '.popup-modal-dismiss', function (e) {
		e.preventDefault();
		$.magnificPopup.close();
	});


	/*-----------------------------------------------------*/
	/* Navigation Menu
   ------------------------------------------------------ */
	var toggleButton = $('.menu-toggle'),
		nav = $('.main-navigation');

	// toggle button
	toggleButton.on('click', function (e) {

		e.preventDefault();
		toggleButton.toggleClass('is-clicked');
		nav.slideToggle();

	});

	// nav items
	nav.find('li a').on("click", function () {

		// update the toggle button 		
		toggleButton.toggleClass('is-clicked');
		// fadeout the navigation panel
		nav.fadeOut();

	});


	/*---------------------------------------------------- */
	/* Highlight the current section in the navigation bar
	------------------------------------------------------ */
	var sections = $("section"),
		navigation_links = $("#main-nav-wrap li a");

	sections.waypoint({

		handler: function (direction) {

			var active_section;

			active_section = $('section#' + this.element.id);

			if (direction === "up") active_section = active_section.prev();

			var active_link = $('#main-nav-wrap a[href="#' + active_section.attr("id") + '"]');

			navigation_links.parent().removeClass("current");
			active_link.parent().addClass("current");

		},

		offset: '25%'
	});


	/*---------------------------------------------------- */
	/* Smooth Scrolling
	------------------------------------------------------ */
	$('.smoothscroll').on('click', function (e) {

		e.preventDefault();

		var target = this.hash,
			$target = $(target);

		$('html, body').stop().animate({
			'scrollTop': $target.offset().top
		}, 800, 'swing', function () {
			window.location.hash = target;
		});

	});


	/*---------------------------------------------------- */
	/*  Placeholder Plugin Settings
	------------------------------------------------------ */
	$('input, textarea, select').placeholder()


	/*---------------------------------------------------- */
	/*	contact form
	------------------------------------------------------ */

	/* local validation */
	$('#contactForm').validate({

		/* submit via ajax */
		submitHandler: function (form) {

			var sLoader = $('#submit-loader');
			// $('#message-warning').fadeOut();

			$.ajax({

				type: "POST",
				url: "/api/email",
				data: $(form).serialize(),
				beforeSend: function () {
					$('.submitform').prop('disabled', true);
					sLoader.fadeIn();
				},
				success: function (msg) {

					// Message was sent
					if (msg == 'OK') {
						sLoader.fadeOut();
						$('#message-warning').hide();
						$('#contactForm').fadeOut();
						$('#message-success').fadeIn();
						$('#thanks').fadeIn();
						$(form)[0].reset();
					}
					// There was an error
					else {
						sLoader.fadeOut();
						$('#contactForm').fadeOut();
						$('#message-success').html(msg);
						$('#message-success').fadeIn();
						$('#thanks').fadeIn();
						$(form)[0].reset();
					}

				},
				error: function (msg) {

					if (msg == 'OK') {
						$('#message-warning').html("Something went wrong. Please try again.");
					} else {
						$('#message-warning').html(msg.responseText || "Something went wrong. Please send an email directly so I can fix this.");
					}
					$('.submitform').prop('disabled', false);
					sLoader.fadeOut();
					$('#message-warning').fadeIn();
				}

			});
		}

	});
	/*---------------------------------------------------- */
	/*	Easter egg
	------------------------------------------------------ */
	var neededkeys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
		started = false,
		key,
		count = 0;
	$(document).keydown(function (e) {
		key = e.keyCode;
		if (!started) {
			if (key == 38) {
				started = true;
			}
		}
		if (started) {
			if (neededkeys[count] == key) {
				count++;
			} else {
				reset();
			}
			if (count == 10) {
				reset();
				// Do your stuff here
				alert('Cheat Codes Activated');
				// Turn down for what
				var s = document.createElement('script');
				s.setAttribute('src', 'https://nthitz.github.io/turndownforwhatjs/tdfw.js');
				document.body.appendChild(s);
			}
		} else {
			reset();
		}
	});

	function reset() {
		started = false;
		count = 0;
	}

	/*----------------------------------------------------- */
	/* Back to top
   ------------------------------------------------------- */
	var pxShow = 300; // height on which the button will show
	var fadeInTime = 400; // how slow/fast you want the button to show
	var fadeOutTime = 400; // how slow/fast you want the button to hide
	var scrollSpeed = 300; // how slow/fast you want the button to scroll to top. can be a value, 'slow', 'normal' or 'fast'

	// Show or hide the sticky footer button
	jQuery(window).scroll(function () {

		if (!($("#header-search").hasClass('is-visible'))) {

			if (jQuery(window).scrollTop() >= pxShow) {
				jQuery("#go-top").fadeIn(fadeInTime);
			} else {
				jQuery("#go-top").fadeOut(fadeOutTime);
			}

		}

	});
	/*----------------------------------------------------- */
	/* Open expandable section
   ------------------------------------------------------- */
	var w = $(".expandable");
	var l = $(".expandable-size");
	w.height(0);

	function toggleExpandable() {
		if (w.hasClass('open')) {
			w.removeClass('open');
			w.height(0);
			$.when($('.fa.fa-times').fadeOut()).done(function () {
				$('div.timeline-ico.ico-colored').removeClass("ico-colored-cross");
				$('.fa.fa-times').remove();
				$('div.timeline-ico.ico-colored').html("<i class='fa fa-arrow-down'></i>");
			});
		} else {
			w.addClass('open');
			w.height(l.outerHeight(true));
			$.when($('.fa.fa-arrow-down').fadeOut()).done(function () {
				$('.fa.fa-arrow-down').remove();
				$('div.timeline-ico.ico-colored').addClass("ico-colored-cross");
				$('div.timeline-ico.ico-colored').html("<i class='fa fa-times'></i>");
			});
		}
	}
	$(".openExpandable").click(toggleExpandable);


	// Hello world 
	
	function placeCaretAtEnd(el) {
		el.focus();
		if (typeof window.getSelection != "undefined"
				&& typeof document.createRange != "undefined") {
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (typeof document.body.createTextRange != "undefined") {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(el);
			textRange.collapse(false);
			textRange.select();
		}
	}
	
	placeCaretAtEnd( document.querySelector('.helloworld') );
	setTimeout(function() {
		$(".helloworld").focus();
	}, 0);
})(jQuery);