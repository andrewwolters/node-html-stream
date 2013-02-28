/*
 * HTML Parser by Andrew Wolters (andrewwolters.nl)
 *
 * Original code by John Resig and Erik Arvidsson, Mozilla Public License 1.1
 *   http://ejohn.org/files/htmlparser.js
 *   http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 */

var fiber = require('fibers');

var elements = require('./elements'),
    events = require('./events'),
    Event = events.Event, Tag = events.Tag, Attr = events.Attr;

// Regular expressions for matching during parsing.
var StartTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,   // (name, rest, unary)
    EndTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,                                                                  // (name)
    Attributes = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;  // (attrs[])

// Iterator over html events.
module.exports = exports = function stream(html) {
    var f = fiber(function fiber_run() {
        parse(html, {
            onstarttag: function(name, attrs, unary) {
                fiber.yield(Event('START', Tag(name, attrs)));
            },
            onendtag: function(name) {
                fiber.yield(Event('END', Tag(name)));
            },
            ontext: function(text) {
                fiber.yield(Event('TEXT', text));
            },
            oncomment: function(text) {
                fiber.yield(Event('COMMENT', text));
            }
        });

        fiber.yield(false);
    });

    return f.run.bind(f);
}

// The parser takes the html string to parse and an optional object containing
// callbacks. For each html token detected, the relevant callback is invoked. 
function parse(html, handler) {
    handler = handler || {};

    var context = {
        stack: [],
        last: function() { return this.stack[this.stack.length - 1]; }
    };

    function nop() {};

    var callbacks = ['oncomment', 'onstarttag', 'onendtag', 'ontext'];
    for (var i = callbacks.length - 1; i >= 0; i--)
        context[callbacks[i]] = handler[callbacks[i]] || nop;

    var index, chars, match,
        previous = html;

    while (html) {
        chars = true;

        if (!context.last() || !elements.Special[context.last()]) {

            // comment
            if (html.substring(0, 4) == "<!--") {
                index = html.indexOf("-->");
                if (index >= 0) {
                    context.oncomment(html.substring(4, index));
                    html = html.substring(index + 3);
                    chars = false;
                }
            }

            // end tag
            else if (html.substring(0, 2) == "</") {
                match = html.match(EndTag);
                if (match) {
                    match[0].replace(EndTag, function (match, name) {
                        processEndTag(context, name);
                    });
                    html = html.substring(match[0].length);
                    chars = false;
                }
            }

            // start tag
            else if (html.charAt(0) == "<") {
                match = html.match(StartTag);
                if (match) {
                    match[0].replace(StartTag, function (match, name, rest, unary) {
                        processStartTag(context, name, rest, unary);
                    });
                    html = html.substring(match[0].length);
                    chars = false;
                }
            }

            // text
            if (chars) {
                index = html.indexOf("<");

                var text;
                if (index < 0) {
                    text = html;
                    html = "";
                } else {
                    text = html.substring(0, index);
                    html = html.substring(index);
                }

                context.ontext(text);
            }
        } else {

            // script or style
            var regex = new RegExp("(.*)<\/" + context.last() + "[^>]*>");
            html = html.replace(regex, function(match, text) {
                var comment = /<!--(.*?)-->/g,
                    cdata = /<!\[CDATA\[(.*?)]]>/g;

                text = text.replace(comment, "$1")
                           .replace(cdata, "$1");

                context.ontext(text);

                return "";                
            });

            processEndTag(context, context.last());
        }

        if (html == previous)
            throw "Parse Error: " + html;
        previous = html;
    }

    processEndTag(context);
};

function processStartTag(context, name, rest, unary) {
    name = name.toLowerCase();
    unary = elements.Empty[name] || !!unary;

    if (elements.Block[name]) {
        while (context.last() && elements.Inline[context.last()])
            processEndTag(context, "", context.last()); 
    }

    if (elements.LazyClosing[name] && context.last() == name) {
        processEndTag(context, "", name);
    }

    if (!unary) {
        context.stack.push(name);
    }

    var attrs = [];
    rest.replace(Attributes, function (match, name) {
        var value = arguments[2] ? arguments[2] :
                    arguments[3] ? arguments[3] :
                    arguments[4] ? arguments[4] :
                    elements.FlagAttributes[name] ? name : "";

        attrs.push(Attr(name, value));
    });

    context.onstarttag(name, attrs, unary);
}

function processEndTag(context, name) {
    var pos = 0;

    if (name) {
        // Find topmost tag of same type in the stack of opened tags.
        for (pos = context.stack.length - 1; pos >= 0; pos--)
            if (context.stack[pos] == name)
                break;
    }

    if (pos >= 0) {
        // Close all the open elements
        for (var i = context.stack.length - 1; i >= pos; i--)
            context.onendtag(context.stack[i]); // emit end tag event

        context.stack.length = pos;
    }
}
