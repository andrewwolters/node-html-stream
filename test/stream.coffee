chai = require 'chai'
html = require '../index'

assert = chai.assert

expect = (it, seq) ->
    i = 0;
    while ev = it()
        exp = seq[i]
        assert.equal(ev.kind, exp[0], 'kind is correct')

        assert.equal(ev.data.name, exp[1]) if ev.kind in ['START', 'END']
        assert.equal(ev.data, exp[1]) if ev.kind in ['TEXT', 'COMMENT']

        i++

describe 'single element', ->
    it 'simple element', ->
        expect(html("<h1>Some element</h1>"), [
            [ 'START', 'h1', {} ],
            [ 'TEXT', 'Some element' ],
            [ 'END', 'h1' ]
        ])

    it 'element with attribute', ->
        expect(html("<span class='foo'>Some element</span>"), [
            [ 'START', 'span', {} ],
            [ 'TEXT', 'Some element' ],
            [ 'END', 'span' ]
        ])
