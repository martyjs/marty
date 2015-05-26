---
layout: page
title: Marty Native
id: marty-native
section: Marty Native
---

[React Native](http://facebook.github.io/react-native/) allows you to build native applications using familiar tools like JavaScript and React. Fortunately Marty code will happily run in a native environment. The only change you need to make is call `require('marty-native')` instead of `require('marty')`. This is because Marty uses React internally and React and React Native are completely separate node modules.

{% highlight js %}
var Marty = require('marty-native');
var React = require('react-native');
var User = require('./views/user');
var Application = require('./application');

var { AppRegistry } = React;
var { ApplicationContainer } = Marty;

// See /guides/developer-tools/index.html#marty-native
require('marty-devtools-observer')(Marty);

var Main = React.createClass({
  getInitialState() {
    return {
      app: new Application()
    };
  },
  render() {
    return (
      <ApplicationContainer app={this.state.app}>
        <User />
      </ApplicationContainer>
    );
  }
});

React.AppRegistry.registerComponent('App', () => Main);
{% endhighlight %}