/*
 * HTML Parser by Andrew Wolters (andrewwolters.nl)
 *
 * Original code by John Resig and Erik Arvidsson, Mozilla Public License 1.1
 *   http://ejohn.org/files/htmlparser.js
 *   http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 */

var util = require('util'),
    elements = require('./elements'),
    events = require('./events');

var Stream = require('stream').Stream;
    Event = events.Event, Tag = events.Tag, Attr = events.Attr;

// Regular expressions for matching during parsing.
var StartTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,   // (name, rest, unary)
    EndTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,                                                                  // (name)
    Attributes = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;  // (attrs[])

// Stream based html parsing
var HtmlStream = module.exports = function() {
    var stream = new Array;
    stream.__proto__ = HtmlStream.prototype;

    var stack = [];
    stack.last = function() { return this[this.length - 1]; };

    Object.defineProperty(stream, 'stack', { value: stack });
    Object.defineProperty(stream, 'buf', { value: '' });
    Object.defineProperty(stream, 'writable', { value: true });

    return stream;
}

util.inherits(HtmlStream, Stream);

HtmlStream.prototype.write = function(html) {
    this._parse(html);
};

HtmlStream.prototype.end = function(html) {
    if (html && html.length)
        this._parse(html);

    if (this.buf.length)
        throw "Parse error: " + this.buf;

    this.emit('end');
};

HtmlStream.prototype.destroy = function() {
    this.writable = false;
    this.emit('close');
};

HtmlStream.prototype._append = function(ev) {
    this[this.length] = ev;
};

HtmlStream.prototype._parse = function(html) {
    var index, chars, match,
        previous = html;

    while (html) {
        chars = true;

        if (!this.stack.last() || !elements.Special[this.stack.last()]) {

            // comment
            if (html.substring(0, 4) == "<!--") {
                index = html.indexOf("-->");
                if (index >= 0) {
                    this._append(Event('COMMENT', html.substring(4, index)));
                    html = html.substring(index + 3);
                    chars = false;
                }
            }

            // end tag
            else if (html.substring(0, 2) == "</") {
                match = html.match(EndTag);
                if (match) {
                    match[0].replace(EndTag, this._parseEndTag.bind(this));
                    html = html.substring(match[0].length);
                    chars = false;
                }
            }

            // start tag
            else if (html.charAt(0) == "<") {
                match = html.match(StartTag);
                if (match) {
                    match[0].replace(StartTag, this._parseStartTag.bind(this));
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

                this._append(Event('TEXT', text));
            }
        } else {

            // script or style
            var regex = new RegExp("(.*)<\/" + this.stack.last() + "[^>]*>");
            html = html.replace(regex, function(match, text) {
                var comment = /<!--(.*?)-->/g,
                    cdata = /<!\[CDATA\[(.*?)]]>/g;

                text = text.replace(comment, "$1")
                           .replace(cdata, "$1");

                this._append(Event('TEXT', text));

                return "";                
            });

            this._parseEndTag(null, this.stack.last());
        }

        if (html == previous)
            throw "Parse Error: " + html;
        previous = html;
    }

    this._parseEndTag();
};

HtmlStream.prototype._parseStartTag = function(tag, name, rest, unary) {
    name = name.toLowerCase();
    unary = elements.Empty[name] || !!unary;

    if (elements.Block[name]) {
        while (this.stack.last() && elements.Inline[this.stack.last()])
            this._parseEndTag("", this.stack.last()); 
    }

    if (elements.LazyClosing[name] && this.stack.last() == name) {
        this._parseEndTag("", name);
    }

    if (!unary) {
        this.stack.push(name);
    }

    var attrs = [];
    rest.replace(Attributes, function (match, name) {
        var value = arguments[2] ? arguments[2] :
                    arguments[3] ? arguments[3] :
                    arguments[4] ? arguments[4] :
                    elements.FlagAttributes[name] ? name : "";

        attrs.push(Attr(name, value));
    });

    this._append(Event('START', Tag(name, attrs, unary)));
};

HtmlStream.prototype._parseEndTag = function(tag, name) {
    var pos = 0;

    if (name) {
        // Find topmost tag of same type in the stack of opened tags.
        for (pos = this.stack.length - 1; pos >= 0; pos--)
            if (this.stack[pos] == name)
                break;
    }

    if (pos >= 0) {
        // Close all the open elements
        for (var i = this.stack.length - 1; i >= pos; i--) {
            var tag = this.stack[i];
            this._append(Event('END', Tag(tag)));
        }

        this.stack.length = pos;
    }
}
