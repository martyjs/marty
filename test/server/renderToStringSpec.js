var React = require('react');
var cheerio = require('cheerio');
var expect = require('chai').expect;
var uuid = require('../../lib/utils/uuid');
var messagesFixture = require('./fixtures/messages');

describe('Marty#renderToString', function () {
  var $, context, Marty, fixture;

  beforeEach(function () {
    Marty = require('../../index').createInstance();
    fixture = messagesFixture(Marty);
    context = Marty.createContext();
    fixture.MessageStore.setContextName('global');
    fixture.MessageStore(context).setContextName('context');
  });

  describe('when you dont pass in a createElement function', function () {
    it('should reject');
  });

  describe('when you don\'t pass in a context', function () {
    it('should reject');
  });

  describe('when you pass in an object that isn\'t a context', function () {
    it('should reject');
  });

  describe('when createElement returns null', function () {
    it('should reject');
  });

  describe('when all the state is present locally', function () {

    beforeEach(function () {
      return renderToString('locally');
    });

    it('should render the html', function () {
      expect($('.text').text()).to.equal('local-context');
    });
  });

  describe('when it needs to wait for state to come from a remote source', function () {
    beforeEach(function () {
      return renderToString('remotely');
    });

    it('should wait for the state to be present before resolving', function () {
      expect($('.text').text()).to.equal('remote-context');
    });
  });

  function renderToString(source) {
    var props = {
      source: source,
      id: uuid.small()
    };

    return Marty.renderToString(function () {
      return React.createElement(fixture.Message, props);
    }, context).then(loadDOM);
  }

  function loadDOM(html) {
    $ = cheerio.load(html);
  }
});