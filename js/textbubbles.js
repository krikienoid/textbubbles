/**
 * Text Bubbles
 *
 * Visualize text as a series of
 * bubbles representing word size.
 *
 *
 * Contributors:
 *
 * reddit.com/u/krikienoid
 * reddit.com/u/qi1
 * reddit.com/u/kylemit
 *
 * MIT License 2014
 */

var textBubbles = (function (window, document, $, undefined) {

    'use strict';

    //
    // Vars
    //

    // Enum bubble size type
    var kBT = {LINEAR : 0, QUADRATIC : 1, CUBIC : 2};

    // Bubble size common size
    // (words of size BASE_LEN will have the same bubble size at any bubble size type.)
    var BASE_LEN = 8;

    // Bubble size scale
    var kBS = {};
        kBS[kBT.LINEAR]    = 1;
        kBS[kBT.QUADRATIC] = window.Math.sqrt(BASE_LEN);
        kBS[kBT.CUBIC]     = window.Math.pow(BASE_LEN, 2 / 3);

    // Settings
    var DEF_SCALE    = 1,
        DEF_SPACING  = 1,
        scale        = DEF_SCALE,
        spacing      = DEF_SPACING,
        isBreaksOn   = true,
        isStatsOn    = true,
        bubbleType   = kBT.QUADRATIC;

    // Regex
    var charLetter    = (
            'a-zA-Z'  + // Latin
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
        rgxDelimiter  = new window.RegExp(

            // nwc NOT followed by [letter, digit, dash, period, or comma] OR
            '\\b(?![' + charLetter + '\\d\\-\\.\\,])|' +

            // nwc followed by dash followed by digit OR
            '\\b(?=\\-\\d)|' +

            // nwc followed by [period, or comma] followed by NOT digit OR
            '\\b(?=[\\.\\,]\\D)|' +

            // zwc followed by dash followed by NOT [letter, or digit] OR
            '(?=\\-[^' + charLetter + '\\d])|' +

            // zwc followed by [whitespace, null, new-line, or underscore]
            '(?=[\\s\\0\\n_])'

        ),
        rgxBreak      = new window.RegExp('[\\r\\n\\v\\f]|\\r\\n', 'g'),
        rgxNonAlphNum = new window.RegExp('[^' + charLetter + '\\d]', 'g'),
        rgxNonLetter  = new window.RegExp('[^' + charLetter + ']', 'g');

    // DOM element refs
    var $input,
        $output;

    // Stats
    var stats;

    //
    // Private Functions
    //

    function resetStats () {
        stats = {
            wordNums : 0,
            words    : 0,
            chars    : 0,
            alphNums : 0,
            letters  : 0,
            longest  : ''
        };
    }

    function getSize (size) {
        switch (bubbleType) {
            case kBT.QUADRATIC : size = window.Math.sqrt(size);       break;
            case kBT.CUBIC     : size = window.Math.pow(size, 1 / 3); break;
        }
        return size * kBS[bubbleType] / 4;
    }

    function updateBubbles () {

        var words   = $input.val().replace(rgxBreak, ' \n').split(rgxDelimiter),
            bubbles = [];

        resetStats();

        $.each(words, function (i, word) {

            var len     = word.replace(rgxNonAlphNum, '').length,
                size    = getSize(len),
                $bubble = $('<div />').addClass('wrapper-word-bubble');

            if (word.search(rgxBreak) >= 0) bubbles.push($('<br />'));

            if (len) {
                $bubble.append(
                    $('<div />').addClass('word-bubble')
                        .attr('data-title', word + ' [' + len + ']')
                        .css({
                            'width'  : size + 'em',
                            'height' : size + 'em',
                            'background-color' : 'hsl(' + (len * 7 - 300) + ', 50%, 50%)'
                        })
                );
            }
            else {
                $bubble.addClass('no-word');
            }

            $bubble.append(
                $('<div />').addClass('word').text(word + ' ')
            );

            bubbles.push($bubble);

            if (isStatsOn) {
                stats.wordNums++;
                if (word.replace(rgxNonLetter, '').length) {
                    stats.words++;
                }
                stats.alphNums += len;
                stats.letters  += word.replace(rgxNonLetter, '').length;
                if (len > stats.longest.replace(rgxNonAlphNum, '').length) {
                    stats.longest = word;
                }
            }

        });

        if (isStatsOn) {
            stats.chars  = $input.val().length;
            $('#textbubbles-stat-wordnums') .text(stats.wordNums);
            $('#textbubbles-stat-chars')    .text(stats.chars);
            $('#textbubbles-stat-alphnums') .text(stats.alphNums);
            $('#textbubbles-stat-letters')  .text(stats.letters);
            $('#textbubbles-stat-avglen')   .text(
                (stats.alphNums)? (stats.alphNums / stats.wordNums).toFixed(1) : 0
            );
            $('#textbubbles-stat-longest')  .text(
                stats.longest +
                ' [' + stats.longest.replace(rgxNonAlphNum, '').length + ']'
            );
        }

        $output.empty().append(bubbles);

    }

    function updateOptions () {
        $('#textbubbles-options').html(
            '.container-bubbles { font-size : ' + scale + 'em; }' +
            '.wrapper-word-bubble { margin : ' + spacing * scale + 'px; }'
        );
    }

    function readDataFromURL () {
        var hashData = window.location.href.split('#')[1];
        if (hashData && hashData.length) {
            $input
                .val(window.unescape(hashData))
                .trigger('input');
        }
    }

    //
    // Init
    //

    $(document).ready(function () {

        // Get DOM elements

        $input  = $('#textbubbles-input');
        $output = $('#textbubbles-output');

        // Event handlers

        $('#textbubbles-set-type')
            .on('change', function () {
                if      (this.value === "cubic")     bubbleType = kBT.CUBIC;
                else if (this.value === "quadratic") bubbleType = kBT.QUADRATIC;
                else                                 bubbleType = kBT.LINEAR;
                updateBubbles();
            });

        $('#textbubbles-set-scale')
            .val(scale)
            .on('change', function () {
                var x = window.parseFloat(this.value);
                if (!window.isNaN(x) && x > 0) {
                    scale = x;
                    updateOptions();
                }
            });

        $('#textbubbles-set-spacing')
            .val(spacing)
            .on('change', function () {
                var x = window.parseFloat(this.value);
                if (!window.isNaN(x) && x >= 0) {
                    spacing = x;
                    updateOptions();
                }
            });

        $('#textbubbles-set-gridded')
            .on('change', function () {
                if (this.checked) $output.addClass('fixed-grid');
                else              $output.removeClass('fixed-grid');
            });

        $('#textbubbles-set-reveal')
            .on('change', function () {
                if (this.checked) $output.addClass('reveal-words');
                else              $output.removeClass('reveal-words');
            });

        $('#textbubbles-set-breaks')
            .on('change', function () {
                if (this.checked) $output.addClass('reveal-breaks');
                else              $output.removeClass('reveal-breaks');
            });

        $('#textbubbles-set-reset')
            .on('click', function () {
                scale     = DEF_SCALE;
                spacing   = DEF_SPACING;
                $('#textbubbles-set-scale').val(scale);
                $('#textbubbles-set-spacing').val(spacing);
                $('#textbubbles-set-gridded').prop('checked', false).trigger('change');
                $('#textbubbles-set-reveal').prop('checked', false).trigger('change');
                $('#textbubbles-set-breaks').prop('checked', false).trigger('change');
                updateOptions();
            });

        $('#textbubbles-get-url')
            .on('click', function () {
                if ($input.val().length) {
                    window.prompt(
                        'Your link:',
                        window.location.href.split('#')[0] + '#' +
                        window.escape($input.val())
                    );
                }
                else {
                    window.alert('Input field is empty!');
                }
            });

        // Init

        updateOptions();
        readDataFromURL();
        $input.on('input', updateBubbles).trigger('input');

    });

})(window, document, jQuery);
