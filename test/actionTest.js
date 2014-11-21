// var sinon = require('sinon');
// var expect = require('chai').expect;
var Action = require('../lib/action');

describe('Action', function () {
  var action, actionType, args, source, creator;

  beforeEach(function () {
    actionType = 'foo';
    args = [1, 2, 3];
    source = 'VIEW';
    creator = 'createFoo';

    action = new Action(
      actionType,
      args,
      source,
      creator
    );
  });

  describe('#toJSON()', function () {
    it('should return the action as an object literal');
  });

  describe('#toString()', function () {
    it('should return a string of the actions JSON representation');
  });

  describe('#rollback()', function () {
    it('should invoke any rollback handlers');
  });

  describe('#addViewHandler()', function () {
    it('should add the handler to the current store handler');
    it('should store the name of the view');
    it('should store the before state of the view');

    describe('#dispose()', function () {
      it('should store the after state of the view');
    });

    describe('#failed()', function () {
      it('should store the thrown exception');
    });
  });

  describe('#addStoreHandler()', function () {
    it('should store the name of the store');
    it('should store the name of the action');
    it('should store the before state of the view');

    describe('#dispose()', function () {
      it('should store the after state of the view');
    });

    describe('#failed()', function () {
      it('should store the thrown exception');
    });
  });
});
