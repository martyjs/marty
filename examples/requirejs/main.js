require.config({
  paths: {
    marty: '../../dist/marty',
    react: '../../node_modules/react/dist/react'
  },
  shim: {
    marty: {
      deps: ['react']
    }
  }
});

require(['react', 'marty'], function (React, Marty) {
  var FooStore = Marty.createStore({
    getInitialState: function () {
      return {
        1: { displayName: 'Foo' },
        2: { displayName: 'Bar' }
      };
    },
    getFoo: function (id) {
      return this.state[id];
    }
  });

  var Application = Marty.createApplication(function () {
    this.register('fooStore', FooStore);
  });

  var Foo = React.createClass({
    render: function () {
      return React.createElement("div", null, this.props.foo.displayName);
    }
  });

  var FooContainer = Marty.createContainer(Foo, {
    listenTo: 'fooStore',
    fetch: {
      foo: function () {
        return this.app.fooStore.getFoo(this.props.id);
      }
    }
  })

  var element = React.createElement(FooContainer, {
    id: 1,
    app: new Application()
  });

  React.render(element, document.getElementById('app'));
});