# Unit tests for the html stream
#
# Inspired on code by astro in node-expat 
#   https://github.com/astro/node-expat/
#

chai = require 'chai'
HtmlStream = require '../index'

assert = chai.assert

s = null

test = (input, exp) ->
    s.on 'end', ->
        evs = Array.prototype.slice.call(s, 0)
        for expected in exp
            ev = evs.shift()

            assert.ok(ev)
            assert.equal(ev.kind, expected[0])

            assert.equal(ev.data.name, expected[1]) if ev.kind in ['START', 'END']
            assert.equal(ev.data, expected[1]) if ev.kind in ['TEXT', 'COMMENT']

            if ev.kind is 'START'
                attrs = {}
                attrs[attr.name] = attr.value for attr in ev.data.attrs
                assert.deepEqual(attrs, expected[2]) if expected[2]

        assert.lengthOf(evs, 0)

    s.end input

beforeEach ->
    s = new HtmlStream()

describe 'single element', ->
    it 'simple', ->
        test "<br />", [
            [ 'START', 'br' ]
        ]

    it 'with attribute', ->
        test "<input type='button' />", [
            [ 'START', 'input', { 'type': 'button' } ]
        ]

    it 'with differently quoted attribtues', ->
        test "<input type=\"text\" value='click'>", [
            [ 'START', 'input', { 'type': 'text', 'value': 'click' }]
        ]

    it 'with namespace mappings'

    it 'with text content', ->
        test "<h1>Heading</h1>", [
            [ 'START', 'h1' ]
            [ 'TEXT', 'Heading' ]
            [ 'END', 'h1' ]
        ]

    it 'with text content and line break'

    it 'with CDATA content'

    it 'with entity text'

    it 'with unicode text'


describe 'comment', ->
    it 'simple', ->
        test "<!-- some comment -->", [
            [ 'COMMENT', ' some comment ' ]
        ]


describe 'tag soup', ->
    it 'unclosed auto-closing element', ->
        test "<p>Paragraph not ending", [
            [ 'START', 'p' ]
            [ 'TEXT', 'Paragraph not ending' ]
            [ 'END', 'p' ]
        ]


describe 'rare situations', ->
    it 'empty string', ->
        test "", []

    it 'undefined input', ->
        test undefined, []

