var cssTestRunner = function()
{
    function test_css(elm, prop, val, label)
    {
        test(
            function() {
                assert_equals(
                   $(elm).css(prop), val
                )
            },
            elm + ':' + prop + ' equals ' + val,
            { timeout: 1000, label: label + ' <span class="selector">(' + elm + ')</span>' }
        );
    }

    function test_css_color(elm, prop, val, label)
    {
        var hex = $(elm).css(prop);
        var clr = new RGBColor(hex);

        test(
            function() {
                assert_equals(
                    clr.toHex().toUpperCase(), val
                )
            },
            elm + ':' + prop + ' equals ' + val,
            { timeout: 1000, label: label }
        );
    }

    function runSuite(data)
    {
        var i = 0, l = data.length, t = {};

        for (i = 0; i < l; i += 1)
        {
            t = data[i];
            $('#target').append(t.dom);

            cssTestRunner.go(t.label, t.selector, t.tests);

            $('#target').empty();
        }
        done();
    }

    return {
        load: function()
        {
            var arrPath = window.location.href.split('?')[1].split('&'),
                param = arrPath.filter(function(p) { return p.indexOf('spec') !== -1; }),
                spec = param[0].split('=')[1],
                url = 'specs/' + spec + '.json';

            setup({
                explicit_done: true,
                timeout: 20000
            })

            // test(function() {assert_true(setup_run)}, "Setup function ran");

            $.ajax(url, {
                dataType: "json",
                cache: false
            }).done($.proxy(function(data) {
                // console.log("Success: " + data);
                runSuite(data);
            }, this)).fail(function(xhr, status, error) {
                console.log("Status: " + status + " Error: " + error);
                // console.log(xhr);
            });
        },

        go: function(label, elm, tests)
        {
            var i = 0, l = tests.length, t = {};

            for (i = 0; i < l; i += 1)
            {
                t = tests[i];

                // if (t[0].indexOf('color') !== -1)
                // {
                //     test_css_color(elm, t[0], t[1], label);
                // }
                // else
                // {
                    test_css(elm, t[0], t[1], label);
                // }
            }
        }
    };
}();


(function (createElement) {
    'use strict';

    var
    MATCH = '(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)',
    QUOTE1 = '(["\'])((?:(?=(\\\\?))\\',
    QUOTE2 = '[\\W\\w])*?)\\',
    REGEX = '^(?:' + MATCH + ')|^#' + MATCH + '|^\\.' + MATCH + '|^\\[' + MATCH + '(?:([*$|~^]?=)' + QUOTE1 + '8' + QUOTE2 + '6' + ')?\\]|^\\s*[\\n\\r]+([\\t]*)\\s*|^(\\s+)|^' + QUOTE1 + '13' + QUOTE2 + '11';

    document.createElement = function (selectorUntrimmed) {
        var
        selector = selectorUntrimmed.replace(/^\s+|\s+$/),
        root = document.createDocumentFragment(),
        nest = [root, createElement.call(this, 'div')];

        for (var frag = root, node = frag.appendChild(nest[1]), index = 1, first = true, match; selector && (match = selector.match(REGEX));) {
            // tag
            if (match[1]) {
                frag.replaceChild(node = createElement.call(this, match[1]), frag.lastChild);

                if (first) nest[index] = node;
            }
            // id
            if (match[2]) node.id = match[2];
            // class
            if (match[3]) node.className += (node.className ? ' ' : '') + match[3];
            // attribute
            if (match[4]) node.setAttribute(match[4], match[7] || '');
            // nesting
            if (match[9] !== undefined) {
                index = match[9].length;

                frag = nest[index];
                node = nest[++index] = frag.appendChild(createElement.call(this, 'div'));
            }
            // child
            if (match[10]) {
                frag = node;
                node = frag.appendChild(createElement.call(this, 'div'));

                first = false;
            }
            // text
            if (match[11]) {
                frag.replaceChild(node = document.createTextNode(match[12]), frag.lastChild);

                if (first) nest[index] = node;
            }

            selector = selector.slice(match[0].length);
        }

        return root.childNodes.length === 1 ? root.lastChild : root;
    };
})(document.createElement);


$(document).ready(function() {
    $('#target').append(document.createElement('span.field\n\tlabel "To: "\n\tinput'));
    // generates <span class="field"><label>To: <input></label></span>)
    // call as target.html?test=1&spec=sugar7/index
    if (window.location.href.indexOf('test=1') !== -1)
    {

        cssTestRunner.load();
    }
});
