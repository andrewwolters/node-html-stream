var fiber = require('fibers');

var parse = require('./parser'),
    events = require('./events'),
    Event = events.Event,
    Tag = events.Tag;

module.exports = exports = function html_stream(html) {
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

