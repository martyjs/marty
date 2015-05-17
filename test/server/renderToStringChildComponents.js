var _ = require('lodash');
var sinon = require('sinon');
var cheerio = require('cheerio');
var expect = require('chai').expect;

describe('Marty#renderToString with child components', function () {
  var $, context, Marty, fixture, expectedId, dispose, Component;

  beforeEach(function () {
    Marty = require('../../marty').createInstance();
    Component = require('./fixtures/childContainerComponents')(Marty);
    context = Marty.createContext();

    return  Marty.renderToString({
      context: context,
      type: Component,
      props: { id: expectedId }
    }).then(loadDOM);
  });

  it('should render both the parent and child component', function () {
    expect($('#child').text()).to.eql('Child');
  });

  function loadDOM(result) {
    $ = cheerio.load(result.html);
  }
});