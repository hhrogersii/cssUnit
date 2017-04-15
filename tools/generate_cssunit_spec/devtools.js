// The function below is executed in the context of the inspected page.
var page_getProperties = function() {

    var $el, $me, type, selector, spec;

    function getCSS($el)
    {
        var sheets = document.styleSheets,
            declare = {};

        for (var i in sheets)
        {
            var rules = sheets[i].rules || sheets[i].cssRules;

            for (var r in rules)
            {
                if ($el.is(rules[r].selectorText))
                    declare = jQuery.extend(declare, css2Json(rules[r].style, $el), css2Json($el.attr('style'), $el));
            }
        }

        return declare;
    }

    function css2Json(css, $el)
    {
        var s = {};

        if (!css) return s;

        if (css instanceof CSSStyleDeclaration)
        {
            for (var i = 0, l = css.length; i < l; i += 1)
                s[css[i]] = $el.css(css[i]);
        }
        else if (typeof css == "string")
        {
            css = css.split("; ");

            for (var i in css)
            {
                var l = css[i].split(": ");
                s[l[0].toLowerCase()] = (l[1]);
            }
        }

        return s;
    }

    function obj2Arr(obj)
    {
        var props = Object.getOwnPropertyNames(obj);
        var arr = [];

        for (var i = 0, l = props.length; i < l; ++i)
            arr.push([props[i], obj[props[i]]]);

        return arr;
    }

    function getSelector(el)
    {
        var selector, classes, type;

        selector = el.tagName.toLowerCase();
        classes = el.className.split(' ').join('.');
        selector += classes ? '.' + classes : '';
        type = jQuery(el).data('type');
        selector += type ? '[data-type=' + type + ']' : '';

        return selector;
    }

    $el = window.jQuery && $0 ? jQuery($0) : null;

    if (!$el) return;

    $me = $el.clone().empty();
    $el.parents().each(function($el) {
        if (this.tagName.toLowerCase() === 'body') return false;
        $me = jQuery(this).clone().empty().append($me);
    });
    selector = getSelector($el.get(0));

    spec = {
        label: 'New Test',
        dom: $me.html(),
        selector: selector,
        tests: obj2Arr(getCSS($el))
    };

    // Output raw JSON to browser console for c/p to spec json
    console.log(JSON.stringify(spec, null, '  '));
    // Output spec object to extension panel for inspection
    return spec;
};

chrome.devtools.panels.elements.createSidebarPane(
    "CSS Test Spec",
    function(sidebar)
    {
        var paneActive = false;

        function updateElementProperties()
        {
            sidebar.setExpression("(" + page_getProperties.toString() + ")()");
        }

        sidebar.onShown.addListener(function() {
            paneActive = true;
        });
        sidebar.onHidden.addListener(function() {
            paneActive = false;
        });

        updateElementProperties();

        chrome.devtools.panels.elements
            .onSelectionChanged.addListener(function() {
                if (paneActive)
                    updateElementProperties();
            });
    }
);
