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

exports.Attr = function(name, value) {
    return Object.create(attr_proto, {
        name: { value: name },
        value: { value: value },
        escaped: { value: value.replace(/(^|[^\\])"/g, '$1\\\"') }
    });
}

var attr_proto = {
    toString: function() {
        return util.format('(%s, %s)', this.name, this.value);
    }
};