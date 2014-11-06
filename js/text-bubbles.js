/**
 * Text Bubbles
 *
 * Visualize text as a series of
 * bubbles representing word size.
 *
 *
 * Contributors:
 *
 * Ken Sugiura, reddit.com/u/krikienoid
 * reddit.com/u/qi1
 * reddit.com/u/kylemit
 *
 * MIT License 2014
 */

var textBubbles = (function () {

	var kBT = {
		LINEAR : 0, QUADRATIC : 1, CUBIC : 2
	};

	var BASE_LEN  = 8,
		BASE_QUAD = Math.sqrt(BASE_LEN),
		BASE_CUBE = Math.pow(BASE_LEN, 2/3);

	var DEF_SCALE    = 5,
		DEF_SPACING  = 1,
		scale        = DEF_SCALE,
		spacing      = DEF_SPACING,
		isGridded    = false,
		regExpUTF    = (
			'\\u00ad' +
			'\\u00c0-\\u00d6\\u00d8-\\u00f6\\u00d8-\\u01bf' + // Extended Latin
			'\\u01c4-\\u02af\\u0370-\\u0373\\u0376\\u0377'  + // Greek and Russian
			'\\u037b-\\u037d\\u0386\\u0388-\\u038a\\u038c'  +
			'\\u038e-\\u03a1\\u03a3-\\u0481\\u048a-\\u0527' +
			'\\u0531-\\u0556\\u0561-\\u0587' + // Armenian
			'\\u05d0-\\u05ea\\u05f0-\\u05f2' + // Hebrew
			'\\u0620-\\u064a\\u0660-\\u0669' + // Arabic
			'\\u066d-\\u06d3\\u06f0-\\u06fc' +
			'\\u0710-\\u072f\\u074d-\\u07a5' +
			'\\u07c0-\\u07ea\\u0800-\\u0815' + // Thaana
			'\\u0840-\\u0858\\u08a0-\\u08b2' + // Mandaic & Arabic Extended
			'\\u0904-\\u0939\\u0958-\\u0961' + // Devanagari
			'\\u0966-\\u096f\\u0972-\\u097f' +
			'\\u0985-\\u098c\\u098f\\u0990\\u0993-\\u09a8' + // Bengali
			'\\u09aa-\\u09b0\\u09b2\\u09b6-\\u09b9' +
			'\\u09dc-\\u09e1\\u09e6-\\u09f1' +
			''
			),
		regExpSplit  = new RegExp('[^a-zA-Z' + regExpUTF + '\\d\\.\\-\'’]'),
		regExpCount  = new RegExp('[^a-zA-Z' + regExpUTF + '\\d]', 'g'),
		regExpLetter = new RegExp('[^a-zA-Z' + regExpUTF + ']', 'g'),
		bubbleType   = kBT.LINEAR;

	var $input,
		$output;

	var isStatsOn = true,
		stats;

	function resetStats () {
		stats = {
			words    : 0,
			chars    : 0,
			alphNums : 0,
			letters  : 0,
			avgLen   : 0,
			longest  : ''
		};
	}

	function getSize (x) {
		switch (bubbleType) {
			case kBT.LINEAR    : return x * scale;
			case kBT.QUADRATIC : return Math.sqrt(x)     * scale * BASE_QUAD;
			case kBT.CUBIC     : return Math.pow(x, 1/3) * scale * BASE_CUBE;
			default            : return x * scale;
		}
	}

	function updateBubbles () {

		var words   = $input.val().split(regExpSplit),
			bubbles = [];

		resetStats();

		$.each(
			words, 
			function (i, word) {
				var len  = word.replace(regExpCount, '').length,
					size = getSize(len);

				if (len) {
					bubbles.push(
						$('<div />')
							.addClass('word-bubble')
							.attr('data-title', '[' + len + '] ' + word)
							.width(size)
							.height(size)
							.css('background-color', 'hsl(' + (len * 7 - 300) + ', 50%, 50%)')
							.css(
								(isGridded)?
									{'margin' : (spacing - size + 10) / 2} :
									{'margin-right' : spacing}
							)
					);
					if (isStatsOn) {
						stats.words    ++;
						stats.alphNums += len;
						stats.letters  += word.replace(regExpLetter, '').length;
						if (len > stats.longest.replace(regExpCount, '').length) {
							stats.longest = word;
						}
					}

				}
			}
		);

		if (isStatsOn) {
			stats.chars  = $input.val().length;
			stats.avgLen = (stats.alphNums / stats.words).toFixed(1);
			$('#text-bubbles-stat-words')    .text(stats.words);
			$('#text-bubbles-stat-chars')    .text(stats.chars);
			$('#text-bubbles-stat-alphnums') .text(stats.alphNums);
			$('#text-bubbles-stat-letters')  .text(stats.letters);
			$('#text-bubbles-stat-avglen')   .text(stats.avgLen);
			$('#text-bubbles-stat-longest')  .text(
				'[' + stats.longest.replace(regExpCount, '').length + ']' + stats.longest
			);
		}

		$output.empty().append(bubbles);

	}

	function readDataFromURL () {
		var hashData = window.location.href.split('#')[1];
		if (hashData && hashData.length) {
			$input
				.val(window.unescape(hashData))
				.trigger('input');
		}
	}

	$(document).ready(function () {

		$input  = $('#text-bubbles-input');
		$output = $('#text-bubbles-output');

		$('#text-bubbles-set-type')
			.on(
				'change',
				function () {
					if     (this.value === "cubic")
						bubbleType = kBT.CUBIC;
					else if(this.value === "quadratic")
						bubbleType = kBT.QUADRATIC;
					else
						bubbleType = kBT.LINEAR;
					updateBubbles();
				}
			);

		$('#text-bubbles-set-scale')
			.val(scale * 10)
			.on(
				'change',
				function () {
					var x = Number(this.value);
					if (!isNaN(x)) {
						scale = x / 10;
						updateBubbles();
					}
				}
			);

		$('#text-bubbles-set-spacing')
			.val(spacing * 5)
			.on(
				'change',
				function () {
					var x = Number(this.value);
					if (!isNaN(x)) {
						spacing = x / 5;
						updateBubbles();
					}
				}
			);

		$('#text-bubbles-set-gridded')
			.on(
				'change',
				function () {
					isGridded = !!this.checked;
					updateBubbles();
				}
			);

		$('#text-bubbles-set-reset')
			.on(
				'click',
				function () {
					scale     = DEF_SCALE;
					spacing   = DEF_SPACING;
					isGridded = false;
					$('#text-bubbles-set-scale').val(scale * 10);
					$('#text-bubbles-set-spacing').val(spacing * 5);
					$('#text-bubbles-set-gridded').attr('checked', isGridded);
					updateBubbles();
				}
			);

		$('#text-bubbles-get-url')
			.on(
				'click',
				function () {
					if ($input.val().length) {
						window.prompt(
							'Your link:',
							window.location.href.split('#')[0] + '#' + window.escape($input.val())
						);
					}
					else {
						window.alert('Input field is empty!');
					}
				}
			);

		$input.on('input', updateBubbles).trigger('input');
		readDataFromURL();

	});

})();
