var util = require('util');

exports.Event = function(kind, data, position) {
    return Object.create(event_proto, {
        kind: { value: kind },
        data: { value: data },
        position: { value: position || {} }
    });
}

var event_proto = {
    toString: function() {
        return util.format('( %s, %s )', this.kind, this.data);
    }
};

exports.Tag = function(name, attrs) {
    return Object.create(tag_proto, {
        name: { value: name },
        attrs: { value: attrs || [] }
    });
}
    
var tag_proto = {
    toString: function() {
        return util.format('%s%s', this.name, this.attrs)
    }
};
