var sinon = require('sinon');
var _ = require('lodash');
var cheerio = require('cheerio');
var expect = require('chai').expect;
var uuid = require('../../lib/utils/uuid');
var describeStyles = require('../lib/describeStyles');
var es6MessagesFixtures = require('./fixtures/es6Messages');
var classicMessagesFixtures = require('./fixtures/classicMessages');

var MARTY_STATE_ID = '__marty-state';

describeStyles('Marty#renderToString', function (styles) {
  var $, context, Marty, fixture, expectedId, dispose;

  beforeEach(function () {
    expectedId = uuid.small();
    Marty = require('../../marty').createInstance();
    fixture = styles({
      classic: function () {
        return classicMessagesFixtures(Marty);
      },
      es6: function () {
        return es6MessagesFixtures(Marty);
      }
    });

    context = Marty.createContext();

    dispose = sinon.stub(context, 'dispose');
    fixture.MessageStore.for(context).setContextName('local-context');
  });

  afterEach(function () {
    dispose.restore();
  });

  describe('when you dont pass in a component type', function () {
    it('should reject', function () {
      return expect(Marty.renderToString({
        context: context
      })).to.be.rejected;
    });
  });

  describe('when you dont pass in something that isn\'t a react component', function () {
    it('should reject', function () {
      return expect(Marty.renderToString({
        type: {},
        context: context
      })).to.be.rejected;
    });
  });

  describe('when you pass in an object that isn\'t a context', function () {
    it('should reject', function () {
      return expect(Marty.renderToString({
        context: {},
        type: fixture.Message
      })).to.be.rejected;
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
      expect($('#' + MARTY_STATE_ID).html()).to.equal(Marty.dehydrate(context).toString());
    });

    it('should call dispose', function () {
      expect(dispose).to.be.calledOnce;
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
      expect($('#' + MARTY_STATE_ID).html()).to.equal(Marty.dehydrate(context).toString());
    });

    it('should call dispose', function () {
      expect(dispose).to.be.calledOnce;
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

    it('should call dispose', function () {
      expect(dispose).to.be.calledOnce;
    });
  });

  function renderToString(options) {
    return Marty.renderToString(_.extend({
      context: context,
      type: fixture.Message,
      props: { id: expectedId }
    }, options)).then(loadDOM);
  }

  function loadDOM(result) {
    $ = cheerio.load(result.html);
  }
});