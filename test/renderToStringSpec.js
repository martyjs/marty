var React = require('react');
var Marty = require('../index');
var cheerio = require('cheerio');
var expect = require('chai').expect;
var Message = require('./fixtures/components/message');
var MessageStore = require('./fixtures/stores/messageStore');

describe('Marty#renderToString', function () {
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

  describe('when all the state is present locally', function () {

    beforeEach(function () {
      return renderToString({ source: 'locally' });
    });

    it('should render the html', function () {
      expect($('.text').text()).to.equal('local-context');
    });
  });

  // describe('when it needs to wait for state to come from a remote source', function () {
  //   beforeEach(function () {
  //     return renderToString({ source: 'remotely' });
  //   });

  //   it('should wait for the state to be present before resolving', function () {
  //     expect($('.text').text()).to.equal('remote-context');
  //   });
  // });

  function renderToString(props) {
    return Marty.renderToString(function () {
      return React.createElement(Message, props);
    }, context).then(loadDOM);
  }

  function loadDOM(html) {
    $ = cheerio.load(html);
  }
});