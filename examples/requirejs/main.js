require.config({
  paths: {
    marty: '../../dist/browser/marty',
    react: '../../node_modules/react/dist/react'
  },
  shim: {
    marty: {
      deps: ['react']
    }
  }
});

require(['react', 'marty'], function (React, Marty) {
  var Store = Marty.createStore({
    id: 'Store',
    getInitialState: function () {
      return {
        1: { displayName: 'Foo' },
        2: { displayName: 'Bar' }
      };
    }
  });

  var App = React.createClass({
    mixins: [Marty.createStateMixin(Store)],
    render: function () {
      return React.createElement("ul", null,
        Object.keys(this.state).map(function (id) {
          return React.createElement("li", null, this.state[id].displayName);
        }, this)
      );
    }
  });

  React.render(React.createElement(App), document.getElementById('app'));
});