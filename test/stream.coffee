# Unit tests for the html stream
#
# Inspired on code by astro in node-expat 
#   https://github.com/astro/node-expat/
#

chai = require 'chai'
HtmlStream = require '../index'

assert = chai.assert

s = null

assert.isEvent = (actual, expected) ->
    assert.propertyVal actual, 'kind', expected[0]

    switch actual.kind
        when 'START'
            assert.deepPropertyVal actual, 'data.name', expected[1] 
            attrs = {}
            attrs[attr.name] = attr.value for attr in actual.data.attrs
            assert.deepEqual attrs, (expected[2] ? {})
        when 'END'
            assert.deepPropertyVal actual, 'data.name', expected[1] 
        when 'TEXT', 'COMMENT'
            assert.propertyVal actual, 'data', expected[1] 
        else
            assert.fail

test = (input, expected, done) ->
    s.on 'finish', ->
        events = Array.prototype.slice.call(s, 0)
        for exp in expected ? {}
            ev = events.shift()
            assert.ok(ev)
            assert.isEvent(ev, exp)

        assert.lengthOf(events, 0)
        done()
    s.end input

beforeEach ->
    s = new HtmlStream()

describe 'single element', ->
    it 'simple', (done) ->
        test "<br />", [
            [ 'START', 'br' ]
        ], done

    it 'with attribute', (done) ->
        test "<input type='button' />", [
            [ 'START', 'input', { 'type': 'button' } ]
        ], done

    it 'with differently quoted attribtues', (done) ->
        test "<input type=\"text\" value='click'>", [
            [ 'START', 'input', { 'type': 'text', 'value': 'click' }]
        ], done

    it 'with namespace mappings'

    it 'with text content', (done) ->
        test "<h1>Heading</h1>", [
            [ 'START', 'h1' ]
            [ 'TEXT', 'Heading' ]
            [ 'END', 'h1' ]
        ], done

    it 'with text content and line break'

    it 'with CDATA content'

    it 'with entity text'

    it 'with unicode text'


describe 'comment', ->
    it 'simple', (done) ->
        test "<!-- some comment -->", [
            [ 'COMMENT', ' some comment ' ]
        ], done


describe 'tag soup', ->
    it 'unclosed auto-closing element', (done) ->
        test "<p>Paragraph not ending", [
            [ 'START', 'p' ]
            [ 'TEXT', 'Paragraph not ending' ]
            [ 'END', 'p' ]
        ], done


describe 'rare situations', ->
    it 'empty string', (done) ->
        test "", [], done

    it 'undefined input', (done) ->
        test undefined, [], done

describe 'stream usage', ->
    it 'pipe to other stream', ->
        assert.throws ->
            P = require('readable-stream').PassThrough
            s.pipe(new P)

    it 'malformed html', ->
        assert.throws ->
            test "/!<!h>"

    it 'multiple incomplete writes', (done) ->
        s.write "<h1"
        s.write ">Head"
        test "ing</h1>", [
            [ 'START', 'h1' ]
            [ 'TEXT', 'Head' ]
            [ 'TEXT', 'ing' ]
            [ 'END', 'h1' ]
        ], done
