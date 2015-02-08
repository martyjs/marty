var React = require('react');
var Marty = require('../index');
var cheerio = require('cheerio');
var expect = require('chai').expect;
var Message = require('./fixtures/components/message');
var MessageStore = require('./fixtures/stores/messageStore');

describe.only('Marty#renderToString', function () {
  var $, context;

  beforeEach(function () {
    context = Marty.createContext();
    MessageStore.setContextName('global');
    MessageStore(context).setContextName('context');
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

  describe('when all the state is present', function () {

    beforeEach(function () {
      return Marty.renderToString(function () {
        return React.createElement(Message, { source: 'locally' });
      }, context).then(loadDOM);
    });

    it('should render the html', function () {
      expect($('.text').text()).to.equal('local-context');
    });
  });

  function loadDOM(html) {
    $ = cheerio.load(html);
  }
});