var expect = require('chai').expect;
var Marty = require('../../../marty');
var warnings = require('../../../lib/warnings');
var describeStyles = require('../../lib/describeStyles');

describeStyles('CookieStateSource', function (styles) {
  var source, cookies;

  beforeEach(function () {
    cookies = require('cookies-js');
    source = styles({
      classic: function () {
        return Marty.createStateSource({
          id: 'Cookies',
          type: 'cookie'
        });
      },
      es6: function () {
        class Cookies extends Marty.CookieStateSource {
        }

        return new Cookies();
      }
    });
  });

  describe('#set()', function () {
    beforeEach(function () {
      source.set('foo', 'bar');
    });

    it('should set the key in the cookie', function () {
      expect(cookies.get('foo')).to.equal('bar');
    });
  });

  describe('#get()', function () {
    beforeEach(function () {
      cookies.set('foo', 'bar');
    });

    it('should retrieve data under key in cookie', function () {
      expect(source.get('foo')).to.equal('bar');
    });
  });

  describe('#expire()', function () {
    beforeEach(function () {
      cookies.set('foo', 'bar');

      source.expire('foo');
    });

    it('should retrieve data under key in cookie', function () {
      expect(source.get('foo')).to.not.exist;
    });
  });
});