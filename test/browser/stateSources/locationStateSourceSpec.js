var expect = require('chai').expect;
var Marty = require('../../../marty');
var warnings = require('marty-core/lib/warnings');
var describeStyles = require('../../lib/describeStyles');

describeStyles('LocationStateSource', function (styles) {
  var source, cookies;

  beforeEach(function () {
    source = styles({
      classic: function () {
        return Marty.createStateSource({
          id: 'Location',
          type: 'location'
        });
      },
      es6: function () {
        class CurrentLocation extends Marty.LocationStateSource {
        }

        return new CurrentLocation();
      }
    });
  });

  describe('#getLocation()', function () {
    var actualLocation;

    beforeEach(function () {
      actualLocation = source.getLocation({
        url: 'http://foo.com/',
        protocol: 'http:',
        search: '?foo=bar&baz=bam',
        pathname: '/foo',
        hostname: 'foo.com'
      });
    });

    it('should return the correct url', function () {
      expect(actualLocation.url).to.equal('http://foo.com/');
    });

    it('should return the correct protocol', function () {
      expect(actualLocation.protocol).to.equal('http');
    });

    it('should return the correct query', function () {
      expect(actualLocation.query).to.eql({
        foo: 'bar',
        baz: 'bam'
      });
    });

    it('should return the correct path', function () {
      expect(actualLocation.path).to.eql('/foo');
    });

    it('should return the correct hostname', function () {
      expect(actualLocation.hostname).to.eql('foo.com');
    });
  });
});