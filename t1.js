var Stream = require('stream').Stream,
    util = require('util');

var Test = function() {
    var arr = new Array;
    arr.__proto__ = Test.prototype;
    Object.defineProperty(arr, 'foo', { value: 1 });
    return arr;
};

util.inherits(Test, Stream);

//Test.prototype = new Array;

Test.prototype.write = function(data) {
    this[this.length] = data;
};

Test.prototype.foo = function() {
    this.emit('foo');
};

var s = new Test;

console.log(s.length);

s.write('foo');
s.write('bar');
s.write('baz');

console.log(s);
console.log(s.length);

console.log(s instanceof Test);
console.log(s instanceof Array);
console.log(s instanceof Stream);

console.log(s.__proto__);
console.log(s.__proto__.__proto__);
console.log(s.__proto__.__proto__.__proto__);
console.log(s.__proto__.__proto__.__proto__.__proto__);

console.log(s[1]);

var a = Array.prototype.slice.call(s, 0);
console.log(a.shift());
console.log(a.shift());
