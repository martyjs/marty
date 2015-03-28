var expect = require('chai').expect;

describe('Marty#register', function () {
  var Marty, expectedId;

  beforeEach(function () {
    expectedId = 'Foo';
    Marty = require('../../marty').createInstance();
  });

  describe('Store', function () {
    var ExpectedStore, ActualStore, expectedInitialState;

    describe('when you dont pass in an id', function () {
      beforeEach(function () {
        expectedInitialState = {
          123: { foo: 'bar' }
        };

        ExpectedStore = createStore(Marty, expectedInitialState);
        ActualStore = Marty.register(ExpectedStore);
      });

      it('should return an instance of the store', function () {
        expect(ActualStore).to.exist;
        expect(ActualStore.getState()).to.eql(expectedInitialState);
        expect(ActualStore.getFoo(123)).to.eql(expectedInitialState[123]);
      });

      it('should default to the class name', function () {
        expect(Marty.registry.getDefault('Store', 'ExpectedStore')).to.equal(ActualStore);
      });

      it('should default to the class name on the default instance', function () {
        expect(Marty.registry.getDefault('Store', 'ExpectedStore').id).to.equal('ExpectedStore');
      });
    });

    describe('when you pass in an id', function () {
      beforeEach(function () {
        expectedInitialState = {
          123: { foo: 'bar' }
        };

        ExpectedStore = createStore(Marty, expectedInitialState);
        ActualStore = Marty.register(ExpectedStore, expectedId);
      });

      it('should return an instance of the store', function () {
        expect(ActualStore).to.exist;
        expect(ActualStore.getState()).to.eql(expectedInitialState);
        expect(ActualStore.getFoo(123)).to.eql(expectedInitialState[123]);
      });

      it('should use the specified id on the default instance', function () {
        expect(Marty.registry.getDefault('Store', expectedId).id).to.equal(expectedId);
      });
    });

    function createStore(Marty, expectedInitialState) {
      return class ExpectedStore extends Marty.Store {
        constructor(options) {
          super(options);
          this.state = expectedInitialState;
        }
        getFoo(id) {
          return this.state[id];
        }
      };
    }
  });

  describe('ActionCreators', function () {
    var ExpectedActionCreators, ActualActionCreators, expectedResult;

    beforeEach(function () {
      expectedResult = 'bar';
    });

    describe('when you dont pass in an id', function () {
      beforeEach(function () {
        ExpectedActionCreators = createActionCreators(Marty);
        ActualActionCreators = Marty.register(ExpectedActionCreators);
      });

      it('should return an instance of the store', function () {
        expect(ActualActionCreators).to.exist;
        expect(ActualActionCreators.test()).to.eql(expectedResult);
      });

      it('should default to the class name', function () {
        expect(Marty.registry.getDefault('ActionCreators', 'ExpectedActionCreators')).to.equal(ActualActionCreators);
      });
    });

    describe('when you pass in an id', function () {
      beforeEach(function () {
        ExpectedActionCreators = createActionCreators(Marty);
        ActualActionCreators = Marty.register(ExpectedActionCreators, expectedId);
      });

      it('should return an instance of the store', function () {
        expect(ActualActionCreators).to.exist;
        expect(ActualActionCreators.test()).to.eql(expectedResult);
      });

      it('should default to the class name', function () {
        expect(Marty.registry.getDefault('ActionCreators', expectedId)).to.equal(ActualActionCreators);
      });
    });

    function createActionCreators(Marty) {
      return class ExpectedActionCreators extends Marty.ActionCreators {
        test() {
          return expectedResult;
        }
      };
    }
  });

  describe('StateSource', function () {
    var ExpectedStateSource, ActualStateSource, expectedResult;

    beforeEach(function () {
      expectedResult = 'bar';
    });

    describe('when you dont pass in an id', function () {
      beforeEach(function () {
        ExpectedStateSource = createStateSource(Marty);
        ActualStateSource = Marty.register(ExpectedStateSource);
      });

      it('should return an instance of the store', function () {
        expect(ActualStateSource).to.exist;
        expect(ActualStateSource.test()).to.eql(expectedResult);
      });

      it('should default to the class name', function () {
        expect(Marty.registry.getDefault('StateSource', 'ExpectedStateSource')).to.equal(ActualStateSource);
      });
    });

    describe('when you pass in an id', function () {
      beforeEach(function () {
        ExpectedStateSource = createStateSource(Marty);
        ActualStateSource = Marty.register(ExpectedStateSource, expectedId);
      });

      it('should return an instance of the store', function () {
        expect(ActualStateSource).to.exist;
        expect(ActualStateSource.test()).to.eql(expectedResult);
      });

      it('should default to the class name', function () {
        expect(Marty.registry.getDefault('StateSource', expectedId)).to.equal(ActualStateSource);
      });
    });

    function createStateSource(Marty) {
      return class ExpectedStateSource extends Marty.StateSource {
        test() {
          return expectedResult;
        }
      };
    }
  });
});
