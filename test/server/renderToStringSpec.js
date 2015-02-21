var React = require('react');
var _ = require('underscore');
var cheerio = require('cheerio');
var expect = require('chai').expect;
var Context = require('../../lib/context');
var uuid = require('../../lib/utils/uuid');
var messagesFixture = require('./fixtures/messages');

var MARTY_STATE_ID = '__marty-state';

describe('Marty#renderToString', function () {
  var $, context, Marty, fixture, expectedId;

  beforeEach(function () {
    expectedId = uuid.small();
    Marty = require('../../index').createInstance();
    fixture = messagesFixture(Marty);
    context = Marty.createContext();
    fixture.MessageStore.for(context).setContextName('local-context');
  });

  describe('when you dont pass in a createElement function', function () {
    it('should reject', function () {
      return expect(Marty.renderToString(null)).to.be.rejected;
    });
  });

  describe('when you don\'t pass in a context', function () {
    it('should reject', function () {
      return expect(Marty.renderToString(_.noop)).to.be.rejected;
    });
  });

  describe('when you pass in an object that isn\'t a context', function () {
    it('should reject', function () {
      return expect(Marty.renderToString(_.noop, {})).to.be.rejected;
    });
  });

  describe('when createElement returns null', function () {
    it('should reject', function () {
      return expect(Marty.renderToString(_.noop, new Context())).to.be.rejected;
    });
  });

  describe('when all the state is present locally', function () {
    beforeEach(function () {
      fixture.MessageStore.for(context).addMessage(expectedId, { text: 'local' });
      return renderToString();
    });

    it('should get the state', function () {
      expect($('.text').text()).to.equal('local');
    });

    it('should come from the correct context', function () {
      expect($('.context').text()).to.equal('local-context');
    });

    it('should include the serialized state', function () {
      expect($('#' + MARTY_STATE_ID).html()).to.equal(Marty.serializeState(context).toString());
    });
  });

  describe('when it needs to wait for state to come from a remote source', function () {
    beforeEach(function () {
      return renderToString();
    });

    it('should get the state', function () {
      expect($('.text').text()).to.equal('remote');
    });

    it('should come from the correct context', function () {
      expect($('.context').text()).to.equal('local-context');
    });

    it('should include the serialized state', function () {
      expect($('#' + MARTY_STATE_ID).html()).to.equal(Marty.serializeState(context).toString());
    });
  });

  describe('timeout', function () {
    beforeEach(function () {
      fixture.MessageAPI.for(context).delay = 1500;

      return renderToString({
        timeout: 100
      });
    });

    it('should render after the timeout regardless of whether fetches are complete', function () {
      expect($('.text').text()).to.equal('pending');
    });
  });

  function renderToString(options) {
    return Marty.renderToString(function () {
      return React.createElement(fixture.Message, { id: expectedId });
    }, context, options).then(loadDOM);
  }

  function loadDOM(html) {
    $ = cheerio.load(html);
  }
});