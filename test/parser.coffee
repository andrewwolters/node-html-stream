chai = require 'chai'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'

parseHtml = require '../lib/parser'
expect = chai.expect

chai.use(sinonChai)

describe 'Html Parser', ->
    handler = starttag = endtag = text = null

    beforeEach ->
        starttag = sinon.spy()
        endtag = sinon.spy()
        text = sinon.spy()

        handler =
            onstarttag: starttag,
            onendtag: endtag,
            ontext: text

    it 'should parse an inline html element', ->
        html =  "<h1>Some element</h1>"

        parseHtml(html, handler)

        expect(starttag).to.have.been.calledOnce
        expect(text).to.have.been.calledOnce
        expect(endtag).to.have.been.calledOnce

    it 'should parse a block element containing a child', ->
        html = "<div><p>Some element</p></div>"

        parseHtml(html, handler)

        expect(starttag).to.have.been.calledTwice
        expect(text).to.have.been.calledOnce
        expect(endtag).to.have.been.calledTwice

    it 'should parse a comment', ->
        html = "<!-- This is a comment -->"

        parseHtml(html, handler)

        expect(starttag).to.not.have.been.called
        expect(text).to.not.have.been.called
        expect(endtag).to.not.have.been.called
