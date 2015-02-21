var _ = require('underscore');

function describeStaticAndClass(description, cb, options = {}) {
  if (options.only) {
    describe.only(description, staticAndClass);
  } else if (options.skip) {
    describe.skip(description, staticAndClass);
  } else {
    staticAndClass();
  }

  function staticAndClass() {
    describe(description + ' (Static)', function () {
      this.factory = factory('static');
      cb.call(this);
    });

    describe(description + ' (Class)', function () {
      this.factory = factory('class');
      cb.call(this);
    });
  }

  function factory(type) {
    return function (options, context) {
      if (!options[type]) {
        throw new Error('Have not implemented factory for ' + type);
      }

      return options[type].call(context);
    };
  }
}

describeStaticAndClass.only = function (description, cb) {
  describeStaticAndClass(description, cb, {
    only: true
  });
}

describeStaticAndClass.skip = function (description, cb) {
  describeStaticAndClass(description, cb, {
    skip: true
  });
}

module.exports = describeStaticAndClass;